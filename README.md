# Gigabit.Host Hosting Platform

## This project is still under development, some features are still not documented or working.

Local development is still a problem, currently we recommend developing on either an x86 linux machine or VM.

Additional to do items can be found in the repo [issues](https://github.com/AndromedaIndustries/gigabit-host/issues).

## Platform Overview

### This repository contains the following services:

- [Web Frontend](apps/web/)
- [Customer Dashboard](apps/admin/)
- [Provisioning Worker](apps/go-worker/)

### The following third-party services:

- [Proxmox](https://proxmox.com/en/) hypervisor
- [Temporal](https://temporal.io/) durable execution platform
- [Nautobot](https://networktocode.com/nautobot/) Network Source of Truth and Automation platform
- [Supabase](https://supabase.com/) Postgres backed auth and database platform

### (Optional) for payments:

- [Stripe](https://stripe.com/) - Payment Processing
