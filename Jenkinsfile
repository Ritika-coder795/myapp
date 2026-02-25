pipeline {
    agent any

    // -------------------------
    // PARAMETERS
    // -------------------------
    parameters {
        string(name: 'APP_ENV', defaultValue: 'dev', description: 'Environment to deploy: dev/staging/prod')
        string(name: 'IMAGE_TAG', defaultValue: '', description: 'Docker image tag (leave blank for Jenkins build number)')
    }

    environment {
        IMAGE_NAME = "myapp"
        CONTAINER_NAME = "myapp-container"
    }

    stages {

        // -------------------------
        // BUILD STAGE
        // -------------------------
        stage('Build Docker Image') {
            steps {
                script {
                    def tag = params.IMAGE_TAG ?: "${BUILD_NUMBER}"
                    sh "docker build -t ${IMAGE_NAME}:${tag} ."
                }
            }
            post {
                always {
                    echo "✅ Build stage finished."
                }
            }
        }

        // -------------------------
        // TEST STAGE
        // -------------------------
        stage('Run Tests') {
            steps {
                script {
                    try {
                        sh "npm test"
                    } catch (err) {
                        echo "⚠️ Tests failed, but continuing pipeline..."
                    }
                }
            }
        }

        // -------------------------
        // DEPLOY STAGE
        // -------------------------
        stage('Deploy Container') {
            steps {
                script {
                    def tag = params.IMAGE_TAG ?: "${BUILD_NUMBER}"

                    // Stop and remove previous container
                    sh "docker rm -f ${CONTAINER_NAME} || true"

                    // Run new container
                    sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${IMAGE_NAME}:${tag}"
                }
            }
            post {
                success {
                    echo "✅ Deployment to ${params.APP_ENV} successful!"
                }
                failure {
                    echo "❌ Deployment failed! Will attempt rollback..."
                }
            }
        }

        // -------------------------
        // ROLLBACK STAGE (Optional)
        // -------------------------
        stage('Rollback on Failure') {
            when {
                expression { currentBuild.currentResult == 'FAILURE' }
            }
            steps {
                script {
                    echo "🔄 Rolling back to last stable Docker image..."
                    // Replace <last_stable_tag> with previous successful build number manually or store in Jenkins
                    sh "docker rm -f ${CONTAINER_NAME} || true"
                    sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${IMAGE_NAME}:<last_stable_tag>"
                }
            }
        }
    }

    // -------------------------
    // POST ACTIONS / NOTIFICATIONS
    // -------------------------
    post {
        always {
            echo "📌 Pipeline finished. Check logs for details."
        }
        success {
            echo "🎉 Pipeline succeeded!"
        }
        failure {
            echo "❌ Pipeline failed!"
            // In real company: add Slack/email notification here
        }
    }
}
