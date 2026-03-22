# Medi-Connect 🏥

A cloud-native AI-enabled Smart Healthcare Appointment & Telemedicine Platform built with Microservices architecture.

> Built as part of SE3020 – Distributed Systems | BSc (Hons) in Information Technology Specialized in Software Engineering | SLIIT 2026

## 🌟 Features

- 👨‍⚕️ Doctor & Patient management
- 📅 Appointment booking & scheduling
- 🎥 Video consultations (Telemedicine)
- 💊 Digital prescriptions
- 💳 Online payments (PayHere / Stripe)
- 📩 SMS & Email notifications
- 🤖 AI-powered symptom checker

## 🏗️ Architecture

Built using **Microservices Architecture** with the following services:

| Service | Description | Port |
|---------|-------------|------|
| API Gateway | Routes requests to services | 8080 |
| Patient Service | Patient registration & management | 8081 |
| Doctor Service | Doctor profiles & availability | 8082 |
| Appointment Service | Booking & scheduling | 8083 |
| Payment Service | Online payment processing | 8084 |
| Notification Service | SMS & email alerts | 8085 |

## 🛠️ Tech Stack

**Backend**
- Java 21 + Spring Boot 3.3
- Spring Data JPA
- Spring Security + JWT
- PostgreSQL

**Frontend**
- Angular 17
- TypeScript

**DevOps**
- Docker
- Kubernetes
- Docker Compose

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Docker Desktop

### Run with Docker Compose
```bash
git clone https://github.com/Ronellaaa/medi-connect.git
cd care-sync
docker-compose up --build
```

### Run individually
```bash
# Start a service
cd patient-service
./mvnw spring-boot:run
```
