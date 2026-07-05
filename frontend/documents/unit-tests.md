# Unit tests

Why were these tests chosen and why the tested code is critical
35 tests across 5 files

## 5 Test Files
- AuthServiceImplTest.java
- DataAccessExceptionAspectTest.java
- TourMetricsCalculatorTest.java
- TourServiceImplOwnershipTest.java
- TourServiceSearchTest.java

## AuthServiceImpl
Tests login and authentication logic. 
---> Critical because incorrect auth handling could allow unauthorized access or incorrectly reject valid users.

## DataAccessExceptionAspectTest
Tests that database exceptions are correctly caught and wrapped into layer-appropriate exceptions.
---> Critical because without this, raw persistence exceptions would leak into the presentation layer, violating the layered architecture requirement.

## TourMetricsCalculatorTest
Tests the computed attributes (popularity, child-friendliness). 
---> Critical because these values are derived from log data and displayed to the user — wrong formulas would silently show incorrect information.

## TourServiceImplOwnershipTest.java
Tests that users can only access/modify their own tours. 
---> Critical because without ownership checks, any logged-in user could read, edit or delete another user's data — a serious security vulnerability.

## TourServiceSearchTest.java
Tests the full-text search and sorting functionality across tour and log fields including computed attributes. 
---> Critical because search is a core feature and incorrect filtering could show wrong results or miss data.