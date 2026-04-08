---
description: "High-performance, reliable, and maintainable code for DevineVibes e-commerce platform. Use when: developing backend (Java/Spring Boot) or frontend (Angular/TypeScript) features."
---

# DevineVibes Development Instructions

## General Principles
- **High Performance**: Always design solutions with performance in mind. Optimize database queries, minimize API calls, and use efficient algorithms. Prioritize caching (Redis), query optimization, pagination, and lazy loading.
- **Reliability**: Ensure code is robust and handles edge cases. Implement proper error handling and validation.
- **Clean Code**: Follow clean coding standards with meaningful names, proper structure, and documentation. Use standard naming formatting.

## Backend (Java/Spring Boot)
- Use concurrent programming whenever possible (e.g., virtual threads, async processing) to handle high loads efficiently. Use for email sending, analytics with multi-threading or parallel streams.
- Implement proper error handling with custom exceptions and global exception handlers. Log errors on server side and send user-friendly messages to users.
- Follow existing patterns: Service layer with @Transactional, DTOs for type safety, JPA entities with proper relationships.
- Ensure reliability through proper validation, logging, and testing.

## Frontend (Angular/TypeScript)
- Follow a modular approach with reusable components. Follow existing patterns for reusability.
- Use existing design patterns and component structures.
- Implement proper error handling in services and interceptors.
- Aim for responsive, mobile-first design.

## Project-Specific
- Maintain consistency with existing codebase patterns.
- For e-commerce features (products, orders, cart), follow established models and APIs.
- Use TypeScript interfaces for type safety across frontend.