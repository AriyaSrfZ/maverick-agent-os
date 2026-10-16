---
type: project
title: Telecom and Fintech Architecture
created: 2026-10-16
tags: [telecom, fintech, sms, pfg, feresta, ledger, iso20022]
---

# Telecom and Fintech Architecture

## Core Platforms and Products
- **Line 3000 SMS Rails:** Persia Fava Gostaresh (PFG) / Magfa national-scale SMS transactional infrastructure.
- **Feresta Platforms:** Web console and high-volume API (`ferestaa.co`, `sms.persiafava.com`).
- **Codebases:** `PFG-Sdks`, Feresta v1.2, carrier part calculator, FastAPI link shortener on `aria-haross.ir`.

## Scale and Operational Parameters
- **Target Enterprise Band:** 50M+ SMS/month (600M to 700M Toman monthly billing band).
- **Commercial Differentiation:** Postpaid billing model to displace prepaid competitors (Kavenegar).
- **Client Footprint:** Tipax (production). Former: DigiPay. Strategic exclusions: Snapp Pay.
- **National Scale:** Designed for 45M+ end users and high concurrency.

## Technical Architecture and Standards
- **High-Throughput Ledger:** 5,000 TPS double-entry transactional ledger and real-time reconciliation engine.
- **Financial Messaging:** ISO 20022 and ISO 8583 message formatting, callback handling, and ledger balancing.
- **Compliance:** Strict adherence to Shaparak payment gateway standards and FATA regulatory requirements.
- **Identity Inquiries:** Digital identity verification APIs (Shahkar telco verification, Sabt Ahval civil registry).
