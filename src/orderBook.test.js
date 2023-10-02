import { OrderBook } from "./OrderBook";
import { expect, describe, it } from "vitest";

describe("Testing OrderBook Cases", () => {
  it("Wrapping raw data to price level.", () => {
    const restMock = {
      E: 1642418914273,
      T: 1642418914267,
      asks: [
        ["481.590", "0.06"],
        ["481.600", "4.83"],
        ["481.640", "2.20"],
        ["481.650", "2.92"],
        ["481.660", "8.63"],
        ["481.670", "11.74"],
        ["481.680", "6.60"],
        ["481.690", "15.71"],
        ["481.700", "51.39"],
        ["481.710", "37.45"],
      ],
      bids: [
        ["481.580", "1.14"],
        ["481.570", "5.56"],
        ["481.560", "7.02"],
        ["481.530", "0.03"],
        ["481.510", "5.20"],
        ["481.500", "12.66"],
        ["481.490", "15.64"],
        ["481.480", "16.07"],
        ["481.470", "9.07"],
        ["481.460", "42.77"],
      ],
      lastUpdateId: 1125555002215,
    };

    const orderbook = new OrderBook({ maxDepth: 20 });
    orderbook.makeSnapshot(restMock);

    expect(orderbook.book.data).eql([
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
    ]);
  });

  it("The maxDepth parameter, which controls the depth of the book.", () => {
    const restMock = {
      E: 1642418914273,
      T: 1642418914267,
      asks: [
        ["481.590", "0.06"],
        ["481.600", "4.83"],
        ["481.640", "2.20"],
        ["481.650", "2.92"],
        ["481.660", "8.63"],
        ["481.670", "11.74"],
        ["481.680", "6.60"],
        ["481.690", "15.71"],
        ["481.700", "51.39"],
        ["481.710", "37.45"],
      ],
      bids: [
        ["481.580", "1.14"],
        ["481.570", "5.56"],
        ["481.560", "7.02"],
        ["481.530", "0.03"],
        ["481.510", "5.20"],
        ["481.500", "12.66"],
        ["481.490", "15.64"],
        ["481.480", "16.07"],
        ["481.470", "9.07"],
        ["481.460", "42.77"],
      ],
      lastUpdateId: 1125555002215,
    };

    const orderbook = new OrderBook({ maxDepth: 0 });
    orderbook.makeSnapshot(restMock);

    expect(orderbook.book.data).eql([]);
  });

  it("Processing data from stream.", () => {
    const streamMock = {
      E: 1642429609544,
      T: 1642429609477,
      U: 1125908846765,
      a: [
        ["0.9352", "351"],
        ["0.9355", "248"],
        ["0.9359", "3441"],
        ["0.9360", "822"],
        ["0.9404", "4135"],
        ["0.9407", "393"],
        ["0.9450", "868"],
        ["0.9454", "1028"],
      ],
      b: [
        ["0.9339", "3619"],
        ["0.9340", "3294"],
        ["0.9341", "2050"],
        ["0.9342", "831"],
        ["0.9343", "1278"],
        ["0.9351", "6"],
      ],
      e: "depthUpdate",
      pu: 1125950988052,
      s: "BAKEUSDT",
      u: 1125950988053,
    };

    const orderbook = new OrderBook({
      shouldCheckUpdateId: false,
      maxDepth: 10,
    });
    orderbook.makeSnapshot({
      asks: [
        ["0.9351", "7"],
        ["0.9352", "1005"],
        ["0.9353", "878"],
        ["0.9354", "9840"],
        ["0.9355", "3859"],
        ["0.9356", "9560"],
        ["0.9357", "2198"],
        ["0.9358", "256"],
        ["0.9359", "664"],
        ["0.9360", "1426"],
      ],
      bids: [
        ["0.9350", "28"],
        ["0.9349", "698"],
        ["0.9348", "1613"],
        ["0.9347", "1754"],
        ["0.9346", "2203"],
        ["0.9344", "36"],
        ["0.9343", "515"],
        ["0.9342", "1465"],
        ["0.9341", "15999"],
        ["0.9340", "12434"],
      ],
      lastUpdateId: 1125950988052,
    });
    const book = orderbook.makeStream(streamMock).book;
    expect(book.data).eql([
      [0.9356, "SELL", 9560],
      [0.9355, "SELL", 248],
      [0.9354, "SELL", 9840],
      [0.9353, "SELL", 878],
      [0.9352, "SELL", 351],
      [0.9351, "BUY", 6],
      [0.935, "BUY", 28],
      [0.9349, "BUY", 698],
      [0.9348, "BUY", 1613],
      [0.9339, "BUY", 3619],
    ]);
    expect(book.bestAsk).equal(0.9352);
    expect(book.bestBid).equal(0.9351);
    expect(book.bestAsk).greaterThan(book.bestBid);
  });

  it("Outdated data.", () => {
    const orderbook = new OrderBook({});
    orderbook.makeSnapshot({ lastUpdateId: 112595098805 });
    expect(() => orderbook.makeStream({}).book).toThrowError(
      /^Received data older than last tick:/,
    );
  });
});