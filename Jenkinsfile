pipeline {
    agent any

    environment {
        DEPLOY_PATH = '/path/to/guai-enterprise/GU.AI-Frontend' 
    }

    stages {
        stage('Restart Container') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} \${SSH_USER} '
                            cd \${DEPLOY_PATH} && git checkout main && git pull origin main
                            docker-compose build frontend
                            docker-compose up -d frontend
                            docker image prune -f
                        '
                    """
                }
            }
        }
    }
}