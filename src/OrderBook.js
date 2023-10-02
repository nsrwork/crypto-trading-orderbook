export class OrderBook {
  constructor({ shouldCheckUpdateId = true, maxDepth = 0 }) {
    this.store = [];
    this.lastUpdateId = 0;
    this.shouldCheckUpdateId = shouldCheckUpdateId;
    this.maxDepth = maxDepth;
    this.deleteLevels = [];
    this.upsertLevels = [];
  }

  makeSnapshot({ asks = [], bids = [], lastUpdateId = 0 }) {
    this.lastUpdateId = lastUpdateId;
    this.wrapInPriceLevel(asks, "SELL");
    this.wrapInPriceLevel(bids, "BUY");
    return this;
  }

  makeStream({ u: updateId = 0, b: bidsRaw = [], a: asksRaw = [] }) {
    this.checkUpdateId(updateId);

    this.fillOutLevels(asksRaw, "SELL");
    this.fillOutLevels(bidsRaw, "BUY");

    this.deleteLevels.forEach((level) => {
      const existingIndex = this.findIndexForSlice(level);
      if (existingIndex !== -1) {
        this.store.splice(existingIndex, 1);
      }
    });

    this.upsertLevels.forEach((level) => {
      const existingIndex = this.findIndexForSlice(level);
      if (existingIndex !== -1) {
        this.replaceLevelAtIndex(existingIndex, level);
      } else {
        this.insertLevel(level);
      }
    });

    this.deleteLevels = [];
    this.upsertLevels = [];

    return this.trackDidUpdateId(updateId);
  }

  sort() {
    // sorts with lowest price last, highest price first
    this.store.sort(
      (a, b) => b[EnumPriceLevel.price] - a[EnumPriceLevel.price],
    );
    return this;
  }

  checkUpdateId(updateId) {
    if (!this.shouldCheckUpdateId) {
      return false;
    }
    // Drop any event where "updateId" is < "lastUpdateId" in the snapshot.
    if (updateId < this.lastUpdateId) {
      throw new Error(
        `Received data older than last tick: ${{
          lastUpdate: this.lastUpdateId,
          currentUpdate: updateId,
        }}`,
      );
    }
  }

  findIndexForSlice(level) {
    return this.store.findIndex(
      (e) => e[EnumPriceLevel.price] === level[EnumPriceLevel.price],
    );
  }

  replaceLevelAtIndex(i, level) {
    this.store.splice(i, 1, level);
  }

  insertLevel(level) {
    this.store.push(level);
  }

  trimToMaxDepth() {
    const book = this.store;
    const maxDepth = this.maxDepth;
    if (book.length <= maxDepth) {
      return this;
    }

    const count = book.reduce(
      (acc, level) => {
        if (level[EnumPriceLevel.side] === "SELL") {
          acc.sells++;
          return acc;
        }
        acc.buys++;
        return acc;
      },
      { buys: 0, sells: 0 },
    );

    const maxPerSide = +(maxDepth / 2).toFixed(0);

    const buysToTrim = count.buys - maxPerSide;
    const sellsToTrim = count.sells - maxPerSide;

    this.sort()
      .trimSideCount(buysToTrim, false)
      .trimSideCount(sellsToTrim, true);

    return this;
  }

  trimSideCount(totalToTrim = 0, shouldTrimTop) {
    if (totalToTrim <= 0) {
      return this;
    }

    const book = this.store;
    if (shouldTrimTop) {
      book.splice(0, totalToTrim);
      return this;
    }

    book.splice(book.length - totalToTrim - 1, totalToTrim);
    return this;
  }

  trackDidUpdateId(updateId) {
    this.lastUpdateId = updateId;
    return this;
  }

  fillOutLevels(rawData, side) {
    rawData.forEach(([price, amount]) => {
      const level = [+price, side, +amount];
      if (level[EnumPriceLevel.qty]) {
        this.upsertLevels.push(level);
      } else {
        this.deleteLevels.push(level);
      }
    });
  }

  wrapInPriceLevel(rawData, side) {
    this.store = [
      ...this.store,
      ...[...rawData].map(([price, amount]) => {
        return [+price, side, +amount];
      }),
    ];
  }

  get bestAsk() {
    const sellSide = this.store.filter(
      (e) => e[EnumPriceLevel.side] === "SELL",
    );
    const index = sellSide.length - 1;
    const bottomSell = sellSide[Math.abs(index)];
    return bottomSell && bottomSell[EnumPriceLevel.price];
  }

  get bestBid() {
    const buySide = this.store.filter((e) => e[EnumPriceLevel.side] === "BUY");
    const topBuy = buySide[0];
    return topBuy && topBuy[EnumPriceLevel.price];
  }

  get book() {
    return {
      data: this.trimToMaxDepth().sort().store,
      bestAsk: this.bestAsk,
      bestBid: this.bestBid,
    };
  }
}

export const EnumPriceLevel = Object.freeze({
  price: 0,
  side: 1,
  qty: 2,
});
