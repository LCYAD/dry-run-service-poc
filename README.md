# Dry Run Service POC

- a service that could be hosted to handle dry run between old implementation and new implementation

## What is the "Dry Run" we are talking about here

- relates to migration of certain operation via new API service
- old logic might be:
  - an API
  - a internal logic within an API (partial migration)
- new service / endpoint is a replacement of the above service / logic and is mostly accessible via API
- the old and new logic is expected to generate the same result

### Some scenario that might require Dry Run Test

- call new service when old service is triggered then compared the result from the service response
  - or one task breaks down into multiple subtask then compare each result
- both old and new service uploads a file and need to download it to compare its content
- data match in DB
  - old and new service both write to its set of DB after operation, and need to compare the result after the allowed period of time assuming no furthur operation happened during the comparsion
  - old service updates DB, then call other service / DB to extract information to see data is synced after the allowed time duration

## What problem are we trying to solve?

- Standardization of test and its error handling
  - each migration has its unique problem set but generally involves calling the new implemenation when the old one is triggered and comparing the result
    - how to trigger, compare the result should be high customization due to its case by case nature
  - when the result do not match, then a unified way to handling the data, notification should be available
- Data security issue when debugging in production
  - Due to senstive information in the input or output, data are usually masked in monitoring tools so not too useful for debugging
  - allowing direct access is not a good policy either but access to production data should be allowed if permission is given to do so
    - approval structure is needed
    - if permission is given to access the data of only the case that has error, then it also need to come with a record of who authorized it for security audit purpose
    - since approver have higher access to data, how do we prevent approver from having too much power to access this information freely?
- Reduce Infrastructure cost of New Service
  - while new service should suppossedly perform much better than the old service / logic, the service need to handle the same traffic as the production server in real time which is not necessary since there is no urgency to do the comparison in real time
  - there should be a separate test for load testing or capacity planning
- Replay test
  - without the original piece of data, very difficult to test if the later fix has corrected the previously error
- (Minor) Statistics collection
  - provide a view over time on what is the accuracy of the new service when compared to old service
  - generating report for release decisions making

## Solution and Design

The solution is to create a service where the old implementation can enqueue a job when its old implemenation is triggered, then this service will help trigger the new service and help compare the results and also perform its error handling

More design detail can be found here

## Setup
