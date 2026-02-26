pipeline {
    agent any
  tools {
    nodejs "node18"
}

    parameters {
        string(name: 'APP_ENV', defaultValue: 'dev', description: 'Environment')
        string(name: 'IMAGE_TAG', defaultValue: '', description: 'Optional image tag')
    }

    environment {
        IMAGE_NAME = "myapp"
        CONTAINER_NAME = "myapp-container"
        DOCKERHUB_REPO = "mritika/myapp"
        DOCKERHUB_CREDENTIALS = "dockerhub-cred"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def tag = IMAGE_TAG ?: "${env.BRANCH_NAME}-${BUILD_NUMBER}"
                    sh "docker build -t ${IMAGE_NAME}:${tag} ."
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    def tag = IMAGE_TAG ?: "${env.BRANCH_NAME}-${BUILD_NUMBER}"
                    sh "docker tag ${IMAGE_NAME}:${tag} ${DOCKERHUB_REPO}:${tag}"
                    sh "docker push ${DOCKERHUB_REPO}:${tag}"
                }
            }
        }

        stage('Deploy (Main Only)') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def tag = IMAGE_TAG ?: "${env.BRANCH_NAME}-${BUILD_NUMBER}"
                    sh "docker rm -f ${CONTAINER_NAME} || true"
                    sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${DOCKERHUB_REPO}:${tag}"
                }
            }
        }

        stage('Tag Last Successful') {
            when {
                allOf {
                    branch 'main'
                    expression { currentBuild.currentResult == 'SUCCESS' }
                }
            }
            steps {
                script {
                    def tag = IMAGE_TAG ?: "${env.BRANCH_NAME}-${BUILD_NUMBER}"
                    sh "docker tag ${DOCKERHUB_REPO}:${tag} ${DOCKERHUB_REPO}:last-successful"
                    sh "docker push ${DOCKERHUB_REPO}:last-successful"
                }
            }
        }

        stage('Rollback') {
            when {
                allOf {
                    branch 'main'
                    expression { currentBuild.currentResult == 'FAILURE' }
                }
            }
            steps {
                sh "docker rm -f ${CONTAINER_NAME} || true"
                sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${DOCKERHUB_REPO}:last-successful"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline Success"
        }
        failure {
            echo "❌ Pipeline Failed"
        }
    }
}      
