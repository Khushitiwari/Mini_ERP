import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as productApi from '../api/productApi';
import * as customerApi from '../api/customerApi';
import * as vendorApi from '../api/vendorApi';
import * as salesOrderApi from '../api/salesOrderApi';
import * as purchaseOrderApi from '../api/purchaseOrderApi';
import * as manufacturingOrderApi from '../api/manufacturingOrderApi';
import * as stockApi from '../api/stockApi';
import * as dashboardApi from '../api/dashboardApi';
import * as auditLogApi from '../api/auditLogApi';
import * as bomApi from '../api/bomApi';
import {
  mapProductFromApi,
  mapPurchaseOrderFromApi,
  mapSalesOrderFromApi,
  mapManufacturingOrderFromApi,
  mapAuditLogFromApi,
  mapBomFromApi,
} from '../api/mappers';
import { showError } from '../utils/helpers';
import { useAuth } from './AuthContext';

const EMPTY_DATA = {
  products: [],
  customers: [],
  vendors: [],
  boms: [],
  salesOrders: [],
  purchaseOrders: [],
  manufacturingOrders: [],
  stockLedger: [],
  bom: {},
  auditLogs: [],
  dashboard: null,
};

const ERPContext = createContext(null);

export const ERPProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(false);

  const updateData = useCallback((key, newValue) => {
    setData((prev) => ({
      ...prev,
      [key]: typeof newValue === 'function' ? newValue(prev[key]) : newValue,
    }));
  }, []);

  const addAuditLog = useCallback(() => {}, []);

  const refreshProducts = useCallback(async () => {
    const products = await productApi.getProducts();
    updateData('products', products.map(mapProductFromApi));
    return products;
  }, [updateData]);

  const refreshCustomers = useCallback(async () => {
    const customers = await customerApi.getCustomers();
    updateData('customers', [...customers]);
    return customers;
  }, [updateData]);

  const refreshVendors = useCallback(async () => {
    const vendors = await vendorApi.getVendors();
    updateData('vendors', [...vendors]);
    return vendors;
  }, [updateData]);

  const refreshBoms = useCallback(async () => {
    const boms = await bomApi.getAllBoms();
    const mapped = boms.map(mapBomFromApi);
    updateData('boms', [...mapped]);
    return mapped;
  }, [updateData]);

  const refreshSalesOrders = useCallback(async () => {
    const orders = await salesOrderApi.getSalesOrders();
    updateData('salesOrders', orders.map(mapSalesOrderFromApi));
    return orders;
  }, [updateData]);

  const refreshPurchaseOrders = useCallback(async () => {
    const orders = await purchaseOrderApi.getPurchaseOrders();
    updateData('purchaseOrders', orders.map(mapPurchaseOrderFromApi));
    return orders;
  }, [updateData]);

  const refreshManufacturingOrders = useCallback(async () => {
    const orders = await manufacturingOrderApi.getManufacturingOrders();
    updateData('manufacturingOrders', orders.map(mapManufacturingOrderFromApi));
    return orders;
  }, [updateData]);

  const refreshStockLedger = useCallback(
    async (productId) => {
      if (productId) {
        const ledger = await stockApi.getStockLedger(productId);
        const products = data.products;
        const mapped = ledger.map((e) => ({
          id: e.id,
          productId: e.productId,
          productName: products.find((p) => p.id === e.productId)?.name ?? '',
          changeQty: e.changeQty,
          reason: e.reason,
          referenceId: e.referenceId,
          referenceType: e.referenceType,
          timestamp: e.timestamp,
        }));
        updateData('stockLedger', [...mapped]);
        return mapped;
      }
      return [];
    },
    [data.products, updateData]
  );

  const syncStockFromBackend = useCallback(async () => {
    const [products, stock] = await Promise.all([
      productApi.getProducts(),
      stockApi.getStock(),
    ]);
    const stockMap = Object.fromEntries(stock.map((s) => [s.id, s]));
    const merged = products.map((p) => {
      const s = stockMap[p.id];
      return mapProductFromApi(s ? { ...p, ...s } : p);
    });
    updateData('products', [...merged]);
    return merged;
  }, [updateData]);

  const refreshDashboard = useCallback(async () => {
    const summary = await dashboardApi.getSummary();
    updateData('dashboard', summary);
    return summary;
  }, [updateData]);

  const refreshAuditLogs = useCallback(async () => {
    const result = await auditLogApi.getAuditLogs({ limit: 100 });
    const items = result.items ?? result;
    updateData('auditLogs', items.map(mapAuditLogFromApi));
    return items;
  }, [updateData]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        products,
        customers,
        vendors,
        boms,
        salesOrders,
        purchaseOrders,
        manufacturingOrders,
        dashboard,
      ] = await Promise.all([
        productApi.getProducts(),
        customerApi.getCustomers(),
        vendorApi.getVendors(),
        bomApi.getAllBoms(),
        salesOrderApi.getSalesOrders(),
        purchaseOrderApi.getPurchaseOrders(),
        manufacturingOrderApi.getManufacturingOrders(),
        dashboardApi.getSummary(),
      ]);

      setData({
        products: products.map(mapProductFromApi),
        customers: [...customers],
        vendors: [...vendors],
        boms: boms.map(mapBomFromApi),
        salesOrders: salesOrders.map(mapSalesOrderFromApi),
        purchaseOrders: purchaseOrders.map(mapPurchaseOrderFromApi),
        manufacturingOrders: manufacturingOrders.map(mapManufacturingOrderFromApi),
        stockLedger: [],
        bom: {},
        auditLogs: [],
        dashboard,
      });
    } catch (err) {
      showError(err, 'Failed to load data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData().catch(() => {});
    } else {
      setData(EMPTY_DATA);
    }
  }, [isAuthenticated, loadInitialData]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const poll = async () => {
      try {
        const [products, stock, salesOrders, purchaseOrders, manufacturingOrders] =
          await Promise.all([
            productApi.getProducts(),
            stockApi.getStock(),
            salesOrderApi.getSalesOrders(),
            purchaseOrderApi.getPurchaseOrders(),
            manufacturingOrderApi.getManufacturingOrders(),
          ]);
        const stockMap = Object.fromEntries(stock.map((s) => [s.id, s]));
        const mergedProducts = products.map((p) => {
          const s = stockMap[p.id];
          return mapProductFromApi(s ? { ...p, ...s } : p);
        });
        setData((prev) => ({
          ...prev,
          products: mergedProducts,
          salesOrders: salesOrders.map(mapSalesOrderFromApi),
          purchaseOrders: purchaseOrders.map(mapPurchaseOrderFromApi),
          manufacturingOrders: manufacturingOrders.map(mapManufacturingOrderFromApi),
        }));
      } catch {
        /* silent poll failure */
      }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      data,
      loading,
      updateData,
      addAuditLog,
      loadInitialData,
      refreshProducts,
      refreshCustomers,
      refreshVendors,
      refreshBoms,
      refreshSalesOrders,
      refreshPurchaseOrders,
      refreshManufacturingOrders,
      refreshStockLedger,
      syncStockFromBackend,
      refreshDashboard,
      refreshAuditLogs,
    }),
    [
      data,
      loading,
      updateData,
      addAuditLog,
      loadInitialData,
      refreshProducts,
      refreshCustomers,
      refreshVendors,
      refreshBoms,
      refreshSalesOrders,
      refreshPurchaseOrders,
      refreshManufacturingOrders,
      refreshStockLedger,
      syncStockFromBackend,
      refreshDashboard,
      refreshAuditLogs,
    ]
  );

  return <ERPContext.Provider value={value}>{children}</ERPContext.Provider>;
};

export const useERP = () => {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error('useERP must be used within ERPProvider');
  return ctx;
};
