declare module 'OrderBook' {
  export class OrderBook {
    constructor(options: {
      shouldCheckUpdateId?: boolean;
      maxDepth?: number;
    });

    handleSnapshot(data: {
      asks?: [number, number][];
      bids?: [number, number][];
      lastUpdateId?: number;
    }): this;

    handleDelta(data: {
      u?: number;
      b?: [number, number][];
      a?: [number, number][];
    }): this;

    sort(): this;

    trimToMaxDepth(): this;

    trackDidUpdateId(updateId: number): this;

    get bestAsk(): number | undefined;

    get bestBid(): number | undefined;

    get book(): {
      data: [number, string, number][];
      bestAsk: number | undefined;
      bestBid: number | undefined;
    };
  }

  export const EnumPriceLevel: {
    price: number;
    side: number;
    qty: number;
  };
}
