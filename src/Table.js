import React, { useState } from "react";
import { useTable, useFilters, useSortBy } from "react-table";

export default function Table({ columns, data, onRowClickHandler }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data
    },
    useFilters,
    useSortBy
  );
  
  const [selectedRowIndexState, setSelectedRowIndexState] = useState(null);
  const [preSelectedRowIndexState, setPreSelectedRowIndexState] = useState(null);

  // Render the UI for your table
  return (
    <>
      <table {...getTableProps({
		    style: {
               borderCollapse:'collapse',
          }})}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={
                    column.isSorted
                      ? column.isSortedDesc
                        ? "sort-desc"
                        : "sort-asc"
                      : ""
                  }
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
			  <tr 
                 {...row.getRowProps({
                    onClick: (e) => {
                       setSelectedRowIndexState(row.index);
                       onRowClickHandler(row, e); // My custom handler 
                    },
                    onMouseOver: (e) => {
                       setPreSelectedRowIndexState(row.index);
                    },
                    style: {
                       //border: row.index === preSelectedRowIndexState ? "red dotted 2px" : 
                       //   row.index === selectedRowIndexState ? "lightGray solid 2px" : ""
                       border: row.index === preSelectedRowIndexState ? "red dotted 2px" :  "" ,
                       background: row.index === selectedRowIndexState ? "lightGray" :  "" ,
                    },      
                    
              })}>
                {row.cells.map(cell => {
                  return (
                    <td { ...cell.getCellProps()}>
                       {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
