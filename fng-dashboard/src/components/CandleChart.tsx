"use client";

import { useEffect, useRef, memo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  CandlestickSeries,
} from "lightweight-charts";
import { CandleData } from "@/lib/binance-api";

interface CandleChartProps {
  data: CandleData[];
  futureData?: CandleData[];
  showFuture?: boolean;
  entryPrice?: number;
  height?: number;
}

function CandleChartComponent({
  data,
  futureData = [],
  showFuture = false,
  entryPrice,
  height = 400,
}: CandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const isDisposedRef = useRef(false);

  // 차트 생성
  useEffect(() => {
    if (!chartContainerRef.current) return;

    isDisposedRef.current = false;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#0d0a08" },
        textColor: "#a08060",
      },
      grid: {
        vertLines: { color: "#1a1512" },
        horzLines: { color: "#1a1512" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#c03030",
          width: 1,
          style: 2,
          labelBackgroundColor: "#c03030",
        },
        horzLine: {
          color: "#c03030",
          width: 1,
          style: 2,
          labelBackgroundColor: "#c03030",
        },
      },
      timeScale: {
        borderColor: "#3d2d1f",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#3d2d1f",
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16c784",
      downColor: "#ea3943",
      borderUpColor: "#16c784",
      borderDownColor: "#ea3943",
      wickUpColor: "#16c784",
      wickDownColor: "#ea3943",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && !isDisposedRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposedRef.current = true;
      window.removeEventListener("resize", handleResize);
      chartRef.current = null;
      seriesRef.current = null;
      chart.remove();
    };
  }, [height]);

  // 데이터 업데이트
  useEffect(() => {
    if (!seriesRef.current || isDisposedRef.current) return;

    // 기본 데이터
    const chartData: CandlestickData<Time>[] = data.map((candle) => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    // 미래 데이터 (보여줄 경우)
    if (showFuture && futureData.length > 0) {
      const futureChartData: CandlestickData<Time>[] = futureData.map((candle) => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));
      chartData.push(...futureChartData);
    }

    seriesRef.current.setData(chartData);

    // 진입가 라인 표시
    if (entryPrice && seriesRef.current && !isDisposedRef.current) {
      const priceLine = seriesRef.current.createPriceLine({
        price: entryPrice,
        color: "#f5d100",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Entry",
      });

      return () => {
        if (seriesRef.current && !isDisposedRef.current) {
          try {
            seriesRef.current.removePriceLine(priceLine);
          } catch {
            // Chart already disposed
          }
        }
      };
    }
  }, [data, futureData, showFuture, entryPrice]);

  // 차트 스크롤 위치 조정
  useEffect(() => {
    if (!chartRef.current || isDisposedRef.current) return;

    // 마지막 캔들이 보이도록 스크롤
    chartRef.current.timeScale().scrollToRealTime();
  }, [data, showFuture]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full rounded-lg overflow-hidden border-2 border-[#3d2d1f]"
    />
  );
}

// memo로 불필요한 리렌더링 방지
export const CandleChart = memo(CandleChartComponent);
