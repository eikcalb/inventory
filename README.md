# Inventory

## Architecture

The storage will use a firebase first approach to enable storing most recent data in cloud. There will be a sync cycle between cloud and local, when there is no network connection, the local storage will be used. Otherwise, when network exists, the local data will check for any discrepancy and fetch the data from firebase.

## Todo List

- ~~Products~~
- Product transactions
    - Adding new products
    - Modifying product quantity
- Authentication