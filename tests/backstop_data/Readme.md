# Data Setup/Requirements
 The backstopJS test suite needs following to be setup in prior

## Dashboard Section

* The current calendar month has at least one day with some activities

## Contact Section
* Make sure the civicase is installed with demo data and should have a contact name "Betty Adams" and have some activities for the contact

---

# Covered Screens
The backstop test suite for Civicase 5.1 extension covers following screens

## Dashboard
- [x] Dashboard Main screen - With overview table expanded and tooltip visible on one of the titles
- [x] Dashboard Overview table with gear icon opened
- [x] Dashboard Main screen - with loading screens
- [x] Dashboard Main screen - Calendar - Acitivity card
- [x] Dashboard Main screen - Calendar - Acitivity card - Loading State
- [ ] Dashboard Main screen  - Empty State

## Activities Feed Panel
- [ ] Activities Feed Panel - Main screen
- [ ] Activities Feed Panel - Loading screen
- [ ] Activities Feed Panel - Bulk action Checkbox enabled and one checkbox checked, and bulk action dropdown opened
- [ ] Activities Feed Panel - Load more state
- [ ] Activities Feed Panel -  filter dropdowns
- [ ] Activities Feed Panel - with one filter enabled
- [ ] Activities Feed Panel - one activity selected
- [ ] Activities Feed Panel - Activity card menu on case overview
- [ ] Activities Feed Panel - Empty State
- [ ] Activities Feed Panel - Detail - Edit state
- [ ] Activities Feed Panel - Detail - Delete state
- [ ] Activities Feed Panel - Under Manage Cases
- [ ] Activities Feed Panel - Under Contact Page

## Manage Cases Screens
- [ ] Manage Cases List - Main screen
- [ ] Manage Cases List - Other Criterion filter button
- [ ] Manage Cases List - Loading screen
- [ ] Manage Cases List - selected case
- [ ] Manage Cases List - Case Overview - with drawer closed
- [ ] Manage Cases List - Case Overview - Empty States
- [ ] Manage Cases List - Case Overview - with calendar activity opened
- [ ] Manage Cases List - Case Overview - Loading
- [ ] Manage Cases List - Case Overview - Edit custom Data
- [ ] Manage Cases List - Case Overview - Add new - Open the popup
- [ ] Manage Cases List - People - Case Roles
- [ ] Manage Cases List - People - Case Roles - Loading
- [ ] Manage Cases List - People - Other Relationships
- [ ] Manage Cases List - People - Other Relationships - Loading
- [ ] Manage Cases List - Files
- [ ] Manage Cases List - Files - Loading
- [ ] Manage Cases List - Files - Upload files - *Skip this if is hard to implement*

## Contact Page
- [ ] Contact Page - Case Tab
- [ ] Contact Page - Case Tab - Loading screen
- [ ] Contact Page - Case Tab - Loading more results icon (When clicked on load more

## Modals
- [ ] Modals - Contact Popover
- [ ] Modals - Additional Contacts Popover
- [ ] Modals - Status popup for activity details
- [ ] Modals - Manage Cases - Next Activity - card menu
- [ ] Modals - Manage Cases - Case Detail - Actions Menu
- [ ] Modals - Manage Cases - Case Detail - Actions Menu - Edit Tags
- [ ] Modals - Manage Cases List - Files - menu actions

# Developer Guide

Scenario object by default contains `label` key and `url` key and [some others](https://github.com/garris/BackstopJS#advanced-scenarios)

This test suite is customised for angular app specific to civicase, so it uses some custom prorperties on top

```
waitForAjaxComplete             // Set to true if any event (click/hover) loads some content through AJAX
isUIBPopover                    // Set to true if the hover state opens a uib popover
captureLoadingScreen            // Sets to true if backstop don't want to wait for loading state to complete and capture the loading screen
```
