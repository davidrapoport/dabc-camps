import React, { useState, useRef, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const ResultsTable = ({ results }) => {
  const gridRef = useRef();
  const [columnDefs, setColumnDefs] = useState([]);

  useEffect(() => {
    const missingStoreCols = {
      headerName: "Amount Missing From Store",
      children: [],
    };
    results.topStores.forEach((store, ind) => {
      const field = {
        headerName: store,
        valueGetter: (params) => params.data.storeData[ind],
      };
      missingStoreCols.children.push(field);
    });
    setColumnDefs([
      { field: "sku" },
      {
        field: "name",
      },
      {
        field: "quantity",
        headerName: "Amount Needed",
      },
      missingStoreCols,
    ]);
  }, [results]);
  const outputData = results.outputData;

  const defaultColDef = useMemo(() => ({
    sortable: true,
    rowDrag: false,
  }));

  const tableHeight = Math.min(500, 42 * outputData.length + 64);

  return (
    <div>
      <div
        className="ag-theme-alpine"
        style={{ width: "100%", height: tableHeight }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={outputData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection="single"
        />
      </div>
    </div>
  );
};

export default ResultsTable;
