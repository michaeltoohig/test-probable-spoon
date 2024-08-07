# TODO

## Caching

- cache static images
- cache dynamic images
- precache API endpoints

## 2024-01-19

- [x] sort out use of bgSyncPlugin or custom implementation (only 1 hour charge)
- [x] retry queue when new movements are submitted

- [x] redirect home instead of login view if logged in
- [x] fix position of notifications
- [x] add "No Service Worker" warning banner
- [x] fix 'ready for offline' banner; explain ready for offline queue etc.
- [x] reorder retry queue UI
- [x] fix deployment with correct service worker
- [ ] send notification to user https://whatpwacando.today/notifications

## 2024-02-07

- [x] Allow create movements while logged out and offline

The user should be able to make movements but they are stored in the queue until authenticated again.

 - [x] store user details in localStorage in JSON format
 - Need to rework beforeEach router logic
   - perhaps require prior login in localStorage to continue?
 - Fetching items in database will fail without a cache containing valid items
   - is login required at all then? users can not fetch data without login anyways.
 - [x] handle 401 errors to inform the user needs to login again to successfully submit the movement

- [x] refactor authStore

The use of `storeUser` and `user` and `avatar` seems a bit much.
More use of getters seems appropriate.

## 2024-02-09

- [x] watch authToken for changes

- [x] filter movement codes based on location type
- [-] translations (not required)

- [x] error from existing `[object Object]` in local storage
- [x] error of infinite loop in router logic when no user but valid auth token
