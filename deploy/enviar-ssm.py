"""Despliega un componente por SSM sin enviar contrasenas en los comandos."""
import json, os, re, shlex, subprocess, time

def aws(*args):
    result=subprocess.run(['aws',*args,'--region','us-east-1','--output','json','--no-cli-pager'],capture_output=True,text=True)
    if result.returncode: raise RuntimeError(result.stderr.strip())
    return json.loads(result.stdout) if result.stdout.strip() else {}

def main():
    component=os.environ['COMPONENT']; bucket=os.environ['AWS_PRIVATE_BUCKET']
    instance=os.environ['EC2_INSTANCE_ID']; image=os.environ['IMAGE_URI']
    revision=os.environ['GITHUB_SHA']; secret=os.environ.get('ORACLE_CREDENTIALS_SECRET_ARN','')
    assert component in ['usuarios','foro','foro-web']
    assert re.fullmatch(r'[a-z0-9][a-z0-9.-]+',bucket)
    assert re.fullmatch(r'i-[a-f0-9]{8,17}',instance)
    assert re.fullmatch(r'[a-f0-9]{40}',revision)
    assert re.fullmatch(r'[0-9]{12}\.dkr\.ecr\.us-east-1\.amazonaws\.com/fullstack3-'+component+r':[a-zA-Z0-9._-]+',image)
    if component!='foro-web':
        assert re.fullmatch(r'arn:aws:secretsmanager:us-east-1:[0-9]{12}:secret:fullstack3/semana5/'+component+r'-oracle-[a-zA-Z0-9]+',secret)
    script=f'/run/foros-s5-{component}-{revision}.sh'
    command=aws('ssm','send-command','--instance-ids',instance,'--document-name','AWS-RunShellScript','--timeout-seconds','900','--parameters',json.dumps({'commands':[
        'set -e',
        f'aws s3 cp s3://{bucket}/deploy/{component}/{revision}.sh {script} --only-show-errors',
        'bash '+script+' '+' '.join(shlex.quote(x) for x in [component,image,bucket,secret])
    ]}))['Command']['CommandId']
    for _ in range(120):
        time.sleep(5)
        try: state=aws('ssm','get-command-invocation','--command-id',command,'--instance-id',instance)
        except RuntimeError as e:
            if 'InvocationDoesNotExist' in str(e): continue
            raise
        if state['Status']=='Success': print(state.get('StandardOutputContent',''));return
        if state['Status'] in ['Failed','Cancelled','TimedOut']:
            raise RuntimeError(state.get('StandardErrorContent','')+'\n'+state.get('StandardOutputContent',''))
    raise TimeoutError('SSM no completo el despliegue')

if __name__=='__main__': main()
