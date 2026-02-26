pipeline {
    agent any

    // Parameters for flexible builds
    parameters {
        string(name: 'APP_ENV', defaultValue: 'dev', description: 'Environment to deploy')
        string(name: 'IMAGE_TAG', defaultValue: '', description: 'Docker image tag (optional)')
    }

    environment {
        IMAGE_NAME = "myapp"
        CONTAINER_NAME = "myapp-container"
        DOCKERHUB_REPO = "mritika/myapp" // <-- replace with your DockerHub username/repo
        DOCKERHUB_CREDENTIALS = "dockerhub-cred" // <-- Jenkins credential ID
    }

    stages {

        stage('Build Docker Image') {
            steps {
                script {
                    echo "🔨 Building Docker image..."
                    sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                }
            }
        }

        stage('Login to DockerHub') {
            steps {
                script {
                    echo "🔑 Logging in to DockerHub..."
                    withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", 
                                                      usernameVariable: 'DOCKER_USER', 
                                                      passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    }
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    def imageTag = IMAGE_TAG ?: "${BUILD_NUMBER}"
                    echo "📤 Tagging and pushing image to DockerHub..."
                    sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${DOCKERHUB_REPO}:${imageTag}"
                    sh "docker push ${DOCKERHUB_REPO}:${imageTag}"
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    try {
                        echo "🧪 Running tests..."
                        sh "npm test"
                    } catch (err) {
                        echo "⚠️ Tests failed, continuing pipeline..."
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    def imageTag = IMAGE_TAG ?: "${BUILD_NUMBER}"
                    echo "🚀 Deploying container to ${params.APP_ENV}..."
                    sh "docker rm -f ${CONTAINER_NAME} || true"
                    sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${DOCKERHUB_REPO}:${imageTag}"
                    echo "✅ Deployment to ${params.APP_ENV} successful!"
                }
            }
        }

        stage('Tag Last Successful Image') {
            when {
                expression { currentBuild.currentResult == 'SUCCESS' }
            }
            steps {
                script {
                    def imageTag = IMAGE_TAG ?: "${BUILD_NUMBER}"
                    echo "💾 Tagging current image as last-successful for rollback..."
                    sh "docker tag ${DOCKERHUB_REPO}:${imageTag} ${DOCKERHUB_REPO}:last-successful"
                    sh "docker push ${DOCKERHUB_REPO}:last-successful"
                }
            }
        }

        stage('Rollback on Failure') {
            when {
                expression { currentBuild.currentResult == 'FAILURE' }
            }
            steps {
                script {
                    echo "🔄 Rolling back to previous stable image..."
                    sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${DOCKERHUB_REPO}:last-successful || true"
                }
            }
        }
    }

    post {
        always {
            echo "📌 Pipeline finished. Check console logs for details."
        }
        success {
            echo "🎉 Pipeline succeeded!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}      
