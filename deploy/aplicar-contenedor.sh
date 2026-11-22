#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
component="${1:?Falta componente}"
image="${2:?Falta imagen}"
bucket="${3:?Falta bucket}"
secret="${4:-}"
region=us-east-1
[[ "$component" =~ ^(usuarios|foro|foro-web)$ ]]
[[ "$image" =~ ^[0-9]{12}\.dkr\.ecr\.us-east-1\.amazonaws\.com/fullstack3-${component}:[a-zA-Z0-9._-]+$ ]]
[[ "$bucket" =~ ^[a-z0-9][a-z0-9.-]+$ ]]
test -f /opt/foros-s5/bootstrap-completo
docker network inspect foros-s5 >/dev/null
registry="${image%%/*}"
aws ecr get-login-password --region "$region" | docker login --username AWS --password-stdin "$registry"
docker pull "$image"
name="${component}-s5"
args=(--detach --name "$name" --restart unless-stopped --network foros-s5 --memory 512m)
if [[ "$component" == foro-web ]]; then
  args+=(-p 127.0.0.1:4300:8080)
  endpoint=http://127.0.0.1:4300/
  expected=200
else
  [[ "$secret" =~ ^arn:aws:secretsmanager:us-east-1:[0-9]{12}:secret:fullstack3/semana5/(usuarios|foro)-oracle-[a-zA-Z0-9]+$ ]]
  private="/opt/foros-s5/private/$component"
  mkdir -p "$private/wallet"
  chmod 700 "$private" "$private/wallet"
  aws secretsmanager get-secret-value --secret-id "$secret" --region "$region" --query SecretString --output text > "$private/oracle.json"
  aws s3 cp "s3://$bucket/wallets/$component.zip" "$private/wallet.zip" --region "$region" --only-show-errors
  python3 - "$private" <<'PY'
import json, os, sys, zipfile
from pathlib import Path
p=Path(sys.argv[1])
data=json.loads((p/'oracle.json').read_text())
with (p/'oracle.env').open('w') as env:
    for key in ['URL','USERNAME','PASSWORD']:
        value=data['DB_'+key]
        if not isinstance(value,str) or any(c in value for c in ['\n','\r','\0']):
            raise ValueError('Formato de configuracion Oracle no valido')
        env.write('SPRING_DATASOURCE_'+key+'='+value+'\n')
    env.write('SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=4\n')
with zipfile.ZipFile(p/'wallet.zip') as z:
    for entry in z.infolist():
        path=Path(entry.filename)
        if path.is_absolute() or '..' in path.parts:
            raise ValueError('Ruta no valida en wallet')
    if 'tnsnames.ora' not in z.namelist():
        raise ValueError('Falta tnsnames.ora en wallet')
    z.extractall(p/'wallet')
for path in (p/'wallet').rglob('*'):
    os.chown(path,10001,10001)
    path.chmod(0o700 if path.is_dir() else 0o600)
os.chown(p/'wallet',10001,10001)
PY
  args+=(--env-file "$private/oracle.env" --mount "type=bind,source=$private/wallet,target=/app/wallet,readonly")
  if [[ "$component" == usuarios ]]; then
    args+=(-p 127.0.0.1:8081:8081)
    endpoint=http://127.0.0.1:8081/usuarios
    expected=401
  else
    args+=(-p 127.0.0.1:8082:8082 --env USUARIOS_URL=http://usuarios-s5:8081)
    endpoint=http://127.0.0.1:8082/categorias
    expected=200
  fi
fi
previous=''
if docker container inspect "$name" >/dev/null 2>&1; then
  previous="$name-prev-$(date +%s)"
  docker stop "$name" >/dev/null
  docker rename "$name" "$previous"
fi
rollback() {
  status=$?
  if [[ "$status" != 0 ]]; then
    docker logs --tail 40 "$name" 2>/dev/null || true
    # Solo se retira el contenedor nuevo fallido; los datos privados estan fuera.
    docker rm -f "$name" >/dev/null 2>&1 || true
    if [[ -n "$previous" ]]; then docker rename "$previous" "$name"; docker start "$name"; fi
  fi
  exit "$status"
}
trap rollback EXIT
docker run "${args[@]}" "$image" >/dev/null
python3 - "$endpoint" "$expected" <<'PY'
import sys,time,urllib.request,urllib.error
url,expected=sys.argv[1],int(sys.argv[2])
for _ in range(45):
    try:
        with urllib.request.urlopen(url,timeout=5) as response:
            code=response.status
            if expected==200 and '/categorias' in url:
                import json
                assert isinstance(json.load(response),list)
    except urllib.error.HTTPError as e:
        code=e.code
    except (OSError,AssertionError,ValueError):
        code=0
    if code==expected:
        print('Comprobacion HTTP correcta:',expected)
        break
    time.sleep(4)
else:
    raise SystemExit('El contenedor no respondio correctamente dentro del plazo')
PY
echo "Componente desplegado: $component"
