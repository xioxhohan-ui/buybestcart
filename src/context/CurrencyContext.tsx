'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AMAZON_SUPPORTED_COUNTRIES,
  AVAILABLE_CURRENCIES,
  AmazonMarketplaceConfig,
  DEFAULT_FALLBACK_MARKETPLACE,
} from '@/lib/geo';
import {
  FALLBACK_EXCHANGE_RATES,
  getStoredCurrency,
  setStoredCurrency,
  getStoredRegion,
  setStoredRegion,
  isUserSelectionManual,
  setAutoDetectedFlag,
  formatPrice as formatPriceHelper,
} from '@/lib/region';

interface CurrencyContextType {
  currency: string;
  countryCode: string;
  marketplace: AmazonMarketplaceConfig;
  rates: Record<string, number>;
  isAmazonSupported: boolean;
  isAutoDetected: boolean;
  setCurrency: (currencyCode: string) => void;
  setRegion: (countryCode: string) => void;
  formatPrice: (amount?: number, fromCurrency?: string) => string;
  convertPrice: (amount?: number, fromCurrency?: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  countryCode: 'US',
  marketplace: DEFAULT_FALLBACK_MARKETPLACE,
  rates: FALLBACK_EXCHANGE_RATES,
  isAmazonSupported: true,
  isAutoDetected: false,
  setCurrency: () => {},
  setRegion: () => {},
  formatPrice: (amount, fromCurrency) => formatPriceHelper(amount, 'USD', FALLBACK_EXCHANGE_RATES, fromCurrency),
  convertPrice: (amount) => amount || 0,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('USD');
  const [countryCode, setCountryCodeState] = useState<string>('US');
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_EXCHANGE_RATES);
  const [isAmazonSupported, setIsAmazonSupported] = useState<boolean>(true);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);

  // Initialize from storage or auto-detect via /api/geo
  useEffect(() => {
    // 1. Check if user already has a manual selection stored
    const manualStored = isUserSelectionManual();
    const storedCurr = getStoredCurrency();
    const storedReg = getStoredRegion();

    if (manualStored && storedCurr) {
      setCurrencyState(storedCurr);
      setCountryCodeState(storedReg || 'US');
      const mkt = AMAZON_SUPPORTED_COUNTRIES[storedReg] || DEFAULT_FALLBACK_MARKETPLACE;
      setIsAmazonSupported(Boolean(AMAZON_SUPPORTED_COUNTRIES[storedReg]));
    } else {
      // 2. Auto-detect country & currency via Server-Side /api/geo
      fetch('/api/geo')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            const detectedCountry = data.effectiveCountry || 'US';
            const detectedCurr = data.currency || 'USD';
            setCountryCodeState(detectedCountry);
            setCurrencyState(detectedCurr);
            setIsAmazonSupported(data.isAmazonSupported ?? true);
            setIsAutoDetected(true);
            setAutoDetectedFlag(detectedCountry, detectedCurr);
          }
        })
        .catch(() => {
          // Fallback to USD on error
          setCurrencyState('USD');
          setCountryCodeState('US');
        });
    }

    // 3. Fetch latest live exchange rates
    fetch('/api/currency')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setRates(data.rates);
        }
      })
      .catch(() => {});
  }, []);

  const handleSetCurrency = useCallback((newCurrency: string) => {
    const upper = newCurrency.toUpperCase();
    setCurrencyState(upper);
    setStoredCurrency(upper);
    setIsAutoDetected(false);

    // If currency matches an Amazon country, sync countryCode
    const matchingCountry = AVAILABLE_CURRENCIES.find((c) => c.code === upper);
    if (matchingCountry) {
      setCountryCodeState(matchingCountry.countryCode);
      setStoredRegion(matchingCountry.countryCode);
    }
  }, []);

  const handleSetRegion = useCallback((newCountry: string) => {
    const upper = newCountry.toUpperCase();
    setCountryCodeState(upper);
    setStoredRegion(upper);
    setIsAutoDetected(false);

    const mkt = AMAZON_SUPPORTED_COUNTRIES[upper];
    if (mkt) {
      setCurrencyState(mkt.currency);
      setStoredCurrency(mkt.currency);
      setIsAmazonSupported(true);
    } else {
      // Non-Amazon country -> USD
      setCurrencyState('USD');
      setStoredCurrency('USD');
      setIsAmazonSupported(false);
    }
  }, []);

  const formatPrice = useCallback(
    (amount?: number, fromCurrency: string = 'USD'): string => {
      return formatPriceHelper(amount, currency, rates, fromCurrency);
    },
    [currency, rates]
  );

  const convertPrice = useCallback(
    (amount?: number, fromCurrency: string = 'USD'): number => {
      if (!amount || isNaN(amount)) return 0;
      const from = fromCurrency.toUpperCase();
      const to = currency.toUpperCase();
      const fromRate = rates[from] || FALLBACK_EXCHANGE_RATES[from] || 1.0;
      const toRate = rates[to] || FALLBACK_EXCHANGE_RATES[to] || 1.0;
      const amountUsd = from === 'USD' ? amount : amount / fromRate;
      return to === 'USD' ? amountUsd : amountUsd * toRate;
    },
    [currency, rates]
  );

  const marketplace =
    AMAZON_SUPPORTED_COUNTRIES[countryCode] ||
    AVAILABLE_CURRENCIES.find((c) => c.code === currency)?.countryCode
      ? AMAZON_SUPPORTED_COUNTRIES[
          AVAILABLE_CURRENCIES.find((c) => c.code === currency)!.countryCode
        ] || DEFAULT_FALLBACK_MARKETPLACE
      : DEFAULT_FALLBACK_MARKETPLACE;

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        countryCode,
        marketplace,
        rates,
        isAmazonSupported,
        isAutoDetected,
        setCurrency: handleSetCurrency,
        setRegion: handleSetRegion,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
