# CATAMS Backend API Reference

> Version: 2025-11-06 · Source: `app/api/*` (Next.js App Router)

This reference consolidates **all backend routes** found under `app/api/…`, replacing and expanding the old `api/contract.md` and `api/curl_suite.md`.

---

## Table of Contents

* [Auth](#auth)
* [Users](#users)
* [Tutor](#tutor)
* [Admin](#admin)

  * [Admin › Allocations](#admin--allocations)
  * [Admin › Tutors](#admin--tutors)
  * [Admin › Paycodes](#admin--paycodes)
  * [Admin › Import / ETL](#admin--import--etl)
  * [Admin › History](#admin--history)
  * [Admin › Discard](#admin--discard)
  * [Admin › Rollback](#admin--rollback)
  * [Admin › Activities](#admin--activities)
* [Allocations](#allocations)

  * [Allocations › Single](#allocations--single)
  * [Allocations › Swap](#allocations--swap)
  * [Allocations › Unscheduled](#allocations--unscheduled)
* [Offerings](#offerings)

  * [Offerings › Core](#offerings--core)
  * [Offerings › Allocations](#offerings--allocations)
  * [Offerings › Budget](#offerings--budget)
  * [Offerings › Requests](#offerings--requests)
* [Requests](#requests)
* [UC](#uc)
* [Claims](#claims)
* [Conventions](#conventions)

