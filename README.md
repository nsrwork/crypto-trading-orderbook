**Order Book**

...

**Installation**

To get started, simply install the library with npm:

```bash
npm i crypto-trading-orderbook
```

**Usage**

Currently, this library supports the Binance Futures crypto exchange. You'll need to obtain your trading data from the API endpoint:

```
GET /fapi/v1/depth
```

You will receive an array of objects in response.

Response from Binance API (https://binance-docs.github.io/apidocs/futures/en/#order-book)

```json
{
  "lastUpdateId": 1125555002215,
  "E": 1642418914273,
  "T": 1642418914267,
  "asks": [
    ["481.590", "0.06"],
    ["481.600", "4.83"],
    ["481.640", "2.20"],
    ["481.650", "2.92"],
    ["481.660", "8.63"],
    ["481.670", "11.74"],
    ["481.680", "6.60"],
    ["481.690", "15.71"],
    ["481.700", "51.39"],
    ["481.710", "37.45"]
  ],
  "bids": [
    ["481.580", "1.14"],
    ["481.570", "5.56"],
    ["481.560", "7.02"],
    ["481.530", "0.03"],
    ["481.510", "5.20"],
    ["481.500", "12.66"],
    ["481.490", "15.64"],
    ["481.480", "16.07"],
    ["481.470", "9.07"],
    ["481.460", "42.77"]
  ]
}
```

Next, you can use the library as follows:

```js
import { OrderBook } from "./OrderBook";

const rawData = JSON.parse(/*Response from Binance API*/);

const orderbook = new OrderBook({ maxDepth: 20 });
orderbook.makeSnapshot(rawData); // or orderbook.makeStream(rawData) for data from websocket;
```

As a result:

```js
console.log(orderbook.book.data);
/**
[
  [481.71, "SELL", 37.45],
  [481.7, "SELL", 51.39],
  [481.69, "SELL", 15.71],
  [481.68, "SELL", 6.6],
  [481.67, "SELL", 11.74],
  [481.66, "SELL", 8.63],
  [481.65, "SELL", 2.92],
  [481.64, "SELL", 2.2],
  [481.6, "SELL", 4.83],
  [481.59, "SELL", 0.06],
  [481.58, "BUY", 1.14],
  [481.57, "BUY", 5.56],
  [481.56, "BUY", 7.02],
  [481.53, "BUY", 0.03],
  [481.51, "BUY", 5.2],
  [481.5, "BUY", 12.66],
  [481.49, "BUY", 15.64],
  [481.48, "BUY", 16.07],
  [481.47, "BUY", 9.07],
  [481.46, "BUY", 42.77],
]
**/
```
