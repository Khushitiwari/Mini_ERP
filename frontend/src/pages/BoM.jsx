import { useEffect, useState } from 'react';
import { useERP } from '../context/ERPContext';
import * as bomApi from '../api/bomApi';
import { mapBomFromApi } from '../api/mappers';
import { showError } from '../utils/helpers';

const emptyComponent = { componentProductId: '', quantityRequired: 1 };
const emptyOperation = { operationName: '', durationMinutes: 30, workCenter: '' };

export default function BoM() {
  const { data, updateData, addAuditLog, refreshBoms } = useERP();
  const [productId, setProductId] = useState('');
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([{ ...emptyComponent }]);
  const [operations, setOperations] = useState([{ ...emptyOperation }]);

  const finishedGoods = data.products.filter((p) => p.type === 'Finished Good');
  const rawMaterials = data.products.filter((p) => p.type === 'Raw Material');

  useEffect(() => {
    if (!productId) {
      setBom(null);
      return;
    }
    setLoading(true);
    bomApi
      .getBom(Number(productId))
      .then((result) => {
        const mapped = mapBomFromApi(result);
        setBom(mapped);
        updateData('bom', (prev) => ({ ...prev, [productId]: mapped }));
        setComponents(mapped.components.length ? mapped.components : [{ ...emptyComponent }]);
        setOperations(mapped.operations.length ? mapped.operations : [{ ...emptyOperation }]);
      })
      .catch(() => {
        setBom(null);
        setComponents([{ ...emptyComponent }]);
        setOperations([{ ...emptyOperation }]);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSave = async () => {
    if (!productId) {
      alert('Select a finished product');
      return;
    }
    const payload = {
      finishedProductId: Number(productId),
      components: components
        .filter((c) => c.componentProductId)
        .map((c) => ({
          componentProductId: Number(c.componentProductId),
          quantityRequired: Number(c.quantityRequired),
        })),
      operations: operations
        .filter((o) => o.operationName)
        .map((o) => ({
          operationName: o.operationName,
          durationMinutes: Number(o.durationMinutes),
          workCenter: o.workCenter,
        })),
    };

    try {
      let result;
      if (bom?.id) {
        result = await bomApi.updateBom(bom.id, {
          components: payload.components,
          operations: payload.operations,
        });
      } else {
        result = await bomApi.createBom(payload);
      }
      const mapped = mapBomFromApi(result);
      setBom(mapped);
      updateData('bom', (prev) => ({ ...prev, [productId]: mapped }));
      await refreshBoms();
      addAuditLog();
      alert('BoM saved successfully');
    } catch (err) {
      showError(err, 'Failed to save BoM');
    }
  };

  const updateComponent = (idx, field, value) => {
    const next = [...components];
    next[idx] = { ...next[idx], [field]: value };
    setComponents(next);
  };

  const updateOperation = (idx, field, value) => {
    const next = [...operations];
    next[idx] = { ...next[idx], [field]: value };
    setOperations(next);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Bill of Materials</h2>
        <p className="page-subtitle">Define components and operations for finished goods</p>
      </div>

      <div className="card form-card">
        <div className="form-group">
          <label>Finished Product</label>
          <select className="form-control" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select product</option>
            {finishedGoods.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>

        {loading && <p>Loading BoM...</p>}

        {productId && !loading && (
          <>
            <div className="line-items">
              <h4>Components</h4>
              {components.map((c, idx) => (
                <div key={idx} className="line-item-row">
                  <select
                    className="form-control"
                    value={c.componentProductId}
                    onChange={(e) => updateComponent(idx, 'componentProductId', e.target.value)}
                  >
                    <option value="">Select component</option>
                    {rawMaterials.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-control"
                    min="0.1"
                    step="0.1"
                    placeholder="Qty required"
                    value={c.quantityRequired}
                    onChange={(e) => updateComponent(idx, 'quantityRequired', e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setComponents([...components, { ...emptyComponent }])}>
                Add Component
              </button>
            </div>

            <div className="line-items">
              <h4>Operations</h4>
              {operations.map((o, idx) => (
                <div key={idx} className="line-item-row">
                  <input
                    className="form-control"
                    placeholder="Operation name"
                    value={o.operationName}
                    onChange={(e) => updateOperation(idx, 'operationName', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Duration (min)"
                    value={o.durationMinutes}
                    onChange={(e) => updateOperation(idx, 'durationMinutes', e.target.value)}
                  />
                  <input
                    className="form-control"
                    placeholder="Work center"
                    value={o.workCenter}
                    onChange={(e) => updateOperation(idx, 'workCenter', e.target.value)}
                  />
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOperations([...operations, { ...emptyOperation }])}>
                Add Operation
              </button>
            </div>

            <button type="button" className="btn btn-primary" onClick={handleSave}>
              {bom?.id ? 'Update BoM' : 'Create BoM'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
