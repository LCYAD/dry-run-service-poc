# TRPC API Documentation

## Overview

This document outlines the TRPC procedures (endpoints) available in the application and their respective flows.

## Routers

### 1. Failed Job Router (`/src/server/api/trpcRouters/failedJob.ts`)

#### Endpoints:

##### `failedJob.getAll`

- **Type**: Query
- **Authentication**: Protected (requires login)
- **Purpose**: Retrieves all failed jobs accessible to the user
- **Authorization**:
  - Developers can only see jobs they have access to
  - Admins can see all jobs
- **Returns**: List of failed jobs with their details

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant DB

    User->>Client: Request failed jobs
    Client->>TRPC: failedJob.getAll()
    TRPC->>DB: Check user role
    alt Is Developer
        TRPC->>DB: Fetch accessible jobs
    else Is Admin
        TRPC->>DB: Fetch all jobs
    end
    DB->>TRPC: Return jobs
    TRPC->>Client: Return filtered jobs
    Client->>User: Display jobs
```

##### `failedJob.download`

- **Type**: Mutation
- **Authentication**: Protected
- **Purpose**: Downloads and decrypts failed job data from S3
- **Parameters**:
  - `id`: Job ID
  - `pKeyfile`: Private key for decryption (Uint8Array)
- **Returns**: Decrypted job data

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant S3
    participant DB

    User->>Client: Request job download
    Client->>TRPC: failedJob.download(id, pKeyfile)
    TRPC->>DB: Get job details
    DB->>TRPC: Return job info
    TRPC->>S3: Download encrypted data
    TRPC->>TRPC: Decrypt data with pKeyfile
    TRPC->>Client: Return decrypted data
    Client->>User: Display job data
```

##### `failedJob.retry`

- **Type**: Mutation
- **Authentication**: Protected
- **Purpose**: Retries a failed job by requeuing it
- **Flow**:
  1. Downloads and decrypts job data
  2. Deletes associated approvals
  3. Removes failed job record
  4. Creates new job in the appropriate queue with the same input
- **Parameters**:
  - `id`: Job ID
  - `pKeyfile`: Private key for decryption

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant S3
    participant DB
    participant Queue

    User->>Client: Initiates job retry
    Client->>TRPC: failedJob.retry(id, pKeyfile)
    TRPC->>DB: Get failed job details
    TRPC->>S3: Download and decrypt job data
    TRPC->>DB: Delete approvals
    par Parallel Operations
        TRPC->>DB: Delete failed job record
        TRPC->>S3: Delete S3 object
    end
    TRPC->>Queue: Push failed job to queue again with the same input
    TRPC->>Client: Success response
    Client->>User: Show success message
```

##### `failedJob.delete`

- **Type**: Mutation
- **Authentication**: Protected
- **Purpose**: Deletes a failed job and its associated data
- **Flow**:
  1. Deletes associated approvals
  2. Removes S3 object
  3. Deletes failed job record
- **Parameters**:
  - `id`: Job ID

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant S3
    participant DB

    User->>Client: Delete job request
    Client->>TRPC: failedJob.delete(id)
    TRPC->>DB: Get job details
    DB->>TRPC: Return job info
    TRPC->>DB: Delete approvals
    par Parallel Operations
        TRPC->>DB: Delete failed job record
        TRPC->>S3: Delete S3 object
    end
    TRPC->>Client: Success response
    Client->>User: Show success message
```

### 2. Approval Router (`/src/server/api/trpcRouters/approval.ts`)

#### Endpoints:

##### `approval.getAll`

- **Type**: Query
- **Authentication**: Protected
- **Purpose**: Retrieves all approvals
- **Authorization**:
  - Developers see only their approvals
  - Admins see all approvals
- **Returns**: List of approvals with associated job details

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant DB

    User->>Client: Request approvals
    Client->>TRPC: approval.getAll()
    TRPC->>DB: Check user role
    alt Is Developer
        TRPC->>DB: Fetch user's approvals
    else Is Admin
        TRPC->>DB: Fetch all approvals
    end
    DB->>TRPC: Return approvals
    TRPC->>Client: Return filtered approvals
    Client->>User: Display approvals
```

##### `approval.create`

- **Type**: Mutation
- **Authentication**: Protected
- **Purpose**: Creates a new approval request
- **Validation**: Prevents duplicate pending approvals
- **Parameters**:
  - `jobId`: ID of the failed job
- **Side Effects**: Creates audit log entry

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant DB

    User->>Client: Request approval
    Client->>TRPC: approval.create(jobId)
    TRPC->>DB: Check existing approvals
    alt Has pending approval
        TRPC->>Client: Error: Pending approval exists
        Client->>User: Show error
    else No pending approval
        par Parallel Operations
            TRPC->>DB: Create approval record
            TRPC->>DB: Create audit log
        end
        TRPC->>Client: Success response
        Client->>User: Show success message
    end
```

##### `approval.updateStatus`

- **Type**: Mutation
- **Authentication**: Protected
- **Purpose**: Updates approval status (approve/reject)
- **Parameters**:
  - `id`: Approval ID
  - `status`: "approved" or "rejected"
- **Side Effects**:
  - Updates failed job if approved
  - Creates audit log entry

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant DB

    User->>Client: Approve/Reject
    Client->>TRPC: approval.updateStatus(id, status)
    TRPC->>DB: Check approval exists
    alt Status is "approved"
        TRPC->>DB: Update failed job
    end
    par Parallel Operations
        TRPC->>DB: Update approval status
        TRPC->>DB: Create audit log
    end
    TRPC->>Client: Success response
    Client->>User: Show updated status
```

##### `approval.delete`

- **Type**: Mutation
- **Authentication**: Protected
- **Purpose**: Deletes an approval
- **Parameters**:
  - `id`: Approval ID

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant TRPC
    participant DB

    User->>Client: Delete approval
    Client->>TRPC: approval.delete(id)
    TRPC->>DB: Check approval exists
    alt Not Found
        TRPC->>Client: Error: Not found
        Client->>User: Show error
    else Found
        TRPC->>DB: Delete approval
        TRPC->>Client: Success response
        Client->>User: Show success message
    end
```

### 3. Audit Log Router (`/src/server/api/trpcRouters/auditLog.ts`)

#### Endpoints:

##### `auditLog.getAll`

- **Type**: Query
- **Authentication**: Protected
- **Purpose**: Retrieves all audit logs
- **Authorization**: Admin only
- **Returns**: List of all audit logs

```mermaid
sequenceDiagram
    actor Admin
    participant Client
    participant TRPC
    participant DB

    Admin->>Client: Request audit logs
    Client->>TRPC: auditLog.getAll()
    TRPC->>DB: Check user role
    alt Not Admin
        TRPC->>Client: Unauthorized error
        Client->>Admin: Show error
    else Is Admin
        TRPC->>DB: Fetch all audit logs
        DB->>TRPC: Return logs
        TRPC->>Client: Return logs
        Client->>Admin: Display audit logs
    end
```

##### `auditLog.delete`

- **Type**: Mutation
- **Authentication**: Protected
- **Purpose**: Deletes an audit log entry
- **Parameters**:
  - `id`: Audit log ID

```mermaid
sequenceDiagram
    actor Admin
    participant Client
    participant TRPC
    participant DB

    Admin->>Client: Delete audit log
    Client->>TRPC: auditLog.delete(id)
    TRPC->>DB: Check user role
    alt Not Admin
        TRPC->>Client: Unauthorized error
        Client->>Admin: Show error
    else Is Admin
        TRPC->>DB: Check log exists
        alt Not Found
            TRPC->>Client: Error: Not found
            Client->>Admin: Show error
        else Found
            TRPC->>DB: Delete log
            TRPC->>Client: Success response
            Client->>Admin: Show success message
        end
    end
```
