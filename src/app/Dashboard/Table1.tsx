import { Fragment, useEffect, useState } from 'react';
import {
  Button,
  Content,
  DataList,
  DataListCheck,
  DataListCell,
  DataListItemCells,
  DataListControl,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  MenuToggle,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  OverflowMenu,
  OverflowMenuGroup,
  OverflowMenuItem,
  PageSection,
  Pagination,
  PaginationVariant
} from '@patternfly/react-core';
import { Table, TableText, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { DragDropSort } from '@patternfly/react-drag-drop';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import { DashboardWrapper } from '@patternfly/react-table/dist/esm/demos/DashboardWrapper';
import { capitalize } from '@patternfly/react-table/src/components/Table/utils/utils';
import { rows, columns, SampleDataRow } from '@patternfly/react-table/dist/esm/demos/sampleData';
import React from 'react';
import Block from '../utils/Block';
import ImageUploadModal from './ImageUploadModal';
import buttonStyles from '@patternfly/react-styles/css/components/Button/button';
import { ConfirmDialog } from '@app/utils/ConfirmDialog';

export const TableColumnManagement: React.FunctionComponent = () => {
  const [formUploadOpen, setFormUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const defaultColumns = ['Id', ' CNPJ', 'Data', 'Valor', 'Hash', 'Status', 'Ação']; //columns;
  const [defaultRows, setDefaultRows] = useState<any[]>([]); // rows;

  const [filters, setFilters] = useState<string[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<string[]>(defaultColumns);
  const [filteredRows, setFilteredRows] = useState<any[]>(defaultRows); //SampleDataRow
  const [managedColumns, setManagedColumns] = useState<string[]>(defaultColumns);
  const [managedRows, setManagedRows] = useState<any[]>(defaultRows); //SampleDataRow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [paginatedRows, setPaginatedRows] = useState<any[]>(rows);

  const [columnData, setColumnData] = useState(defaultColumns.map((col) => ({ name: col, checked: true })));
  const [initialColData, setInitialColData] = useState(columnData);

  const btnClasses = [buttonStyles.button, buttonStyles.modifiers.secondary].join(' ');


  const matchSelectedColumnNameToAttr = (name: string): string => {
    switch (name) {
      case 'Id':
        return 'id';
      case 'CNPJ':
        return 'cnpj';
      case 'Data':
        return 'data_emissao';
      case 'Hash':
        return 'imagem_hash';
      case 'Valor':
        return 'valor_total';
      case 'Status':
        return 'status';
      case 'Ação':
        return 'acao';
      default:
        return '';
    }
  };

  // Pagination logic
  const handleSetPage = (
    _evt: MouseEvent | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (
    _evt: MouseEvent | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
    newPerPage: number
  ) => {
    setPerPage(newPerPage);
  };

  const renderPagination = (variant: 'top' | 'bottom' | PaginationVariant, isCompact: boolean) => (
    <Pagination
      isCompact={isCompact}
      itemCount={managedRows.length}
      page={page}
      perPage={perPage}
      onSetPage={handleSetPage}
      onPerPageSelect={handlePerPageSelect}
      variant={variant}
      titles={{
        paginationAriaLabel: `${variant} pagination`
      }}
    />
  );

  useEffect(() => {

    fetchData()

  }, [])

  function fetchData() {
    async function buscarJson() {
      try {
        const resposta = await fetch('http://127.0.0.1:8000/invoices'); // 'http://localhost:3000/tarefas' https://jsonplaceholder.typicode.com/posts http://localhost:3000/tarefas
        if (!resposta.ok) {
          throw new Error('Erro ao carregar JSON');
        }
        const json = await resposta.json();
        setDefaultRows(json);
        setManagedRows(json);
        setPaginatedRows(json.slice((page - 1) * perPage, page * perPage - 1));
      } catch (erro) {
        console.error('Erro:', erro);
      } finally {
        //setTimeout(() => {  // Delay
        setLoading(false);
        //}, 900);
      }
    }
    buscarJson();
  }

  const formatarParaReais = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  useEffect(() => {
    setPaginatedRows(managedRows.slice((page - 1) * perPage, page * perPage - 1));
  }, [managedRows, page, perPage]);

  // Removes attribute from each node object in Data.jsx
  const removePropFromObject = (object: any, keys: string[]): any =>
    keys.reduce((obj, prop) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [prop]: _, ...keep } = obj;
      return keep;
    }, object);

  // Filters columns out of table that are not selected in the column management modal
  const filterData = (checked: boolean, name: string) => {
    const selectedColumn = matchSelectedColumnNameToAttr(name);

    const filteredRows: SampleDataRow[] = [];
    if (checked) {
      const updatedFilters = filters.filter((item) => item !== selectedColumn);

      // Only show the names of columns that were selected in the modal
      const filteredColumns = defaultColumns.filter(
        (column) => !updatedFilters.includes(matchSelectedColumnNameToAttr(column))
      );

      // Remove the attributes (i.e. "columns") that were not selected
      defaultRows.forEach((item) => filteredRows.push(removePropFromObject(item, updatedFilters)));

      setFilters(updatedFilters);
      setFilteredColumns(filteredColumns);
      setFilteredRows(filteredRows);
    } else {
      const updatedFilters = filters;
      updatedFilters.push(selectedColumn);

      // Only show the names of columns that were selected in the modal
      const filteredColumns = managedColumns.filter(
        (column) => !filters.includes(matchSelectedColumnNameToAttr(column))
      );

      // Remove the attributes (i.e. "columns") that were not selected
      managedRows.forEach((item) => filteredRows.push(removePropFromObject(item, updatedFilters)));

      setFilters(updatedFilters);
      setFilteredColumns(filteredColumns);
      setFilteredRows(filteredRows);
    }
  };

  const unfilterAllData = () => {
    setFilters([]);
    setFilteredColumns(defaultColumns);
    setFilteredRows(defaultRows);
  };

  const handleModalToggle = (_event: React.MouseEvent<Element, MouseEvent> | KeyboardEvent) => {
    setIsModalOpen(!isModalOpen);
    setInitialColData(columnData);
  };

  const onSave = () => {
    const orderedFilteredColumns: string[] = [];
    columnData.map((col) => {
      if (filteredColumns.find((filteredCol) => filteredCol === col.name)) {
        orderedFilteredColumns.push(col.name);
      }
    });

    const orderedFilteredRows = filteredRows.map((row) => {
      let orderedRow;
      columnData.map((col) => {
        if (filteredColumns.find((filteredCol) => filteredCol === col.name)) {
          const rowField = matchSelectedColumnNameToAttr(col.name);
          orderedRow = { ...orderedRow, [rowField]: row[rowField] };
        }
      });
      return orderedRow;
    });

    setManagedColumns(orderedFilteredColumns);
    setManagedRows(orderedFilteredRows);
    setPaginatedRows(filteredRows);
    setIsModalOpen(!isModalOpen);
  };

  const selectAllColumns = () => {
    unfilterAllData();
    setColumnData(columnData.map((col) => ({ name: col.name, checked: true })));
  };

  const renderModal = () => (
    <Modal
      isOpen={isModalOpen}
      variant="small"
      onClose={handleModalToggle}
      aria-labelledby="basic-modal-title"
      aria-describedby="modal-box-body-basic"
    >
      <ModalHeader
        title="Configurar Colunas"
        labelId="basic-modal-title"
        description={
          <Content>
            <p>Selecione as colunas que ficarão visíveis.</p>
            <Button isInline onClick={selectAllColumns} variant="secondary">
              Select all
            </Button>
          </Content>
        }
      />
      <ModalBody id="modal-box-body-basic">
        <DragDropSort
          items={columnData.map((colData) => ({
            id: colData.name,
            content: (
              <>
                <DataListControl>
                  <DataListCheck
                    aria-labelledby={`table-column-management-item-${colData.name}`}
                    isChecked={colData.checked}
                    name={`check-${colData.name}`}
                    id={`check-${colData.name}`}
                    onChange={(event: React.FormEvent<HTMLInputElement>, _checked: boolean) => {
                      let newColumnData: { name: string; checked: boolean }[] = [];

                      columnData.map((colData) => {
                        if (event.currentTarget.name === `check-${colData.name}`) {
                          newColumnData = [...newColumnData, { name: colData.name, checked: !colData.checked }];
                          filterData(!colData.checked, colData.name);
                        } else {
                          newColumnData = [...newColumnData, colData];
                        }
                      });

                      setColumnData(newColumnData);
                    }}
                  />
                </DataListControl>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell
                      id={`table-column-management-item-${colData.name}`}
                      key={`table-column-management-item-${colData.name}`}
                    >
                      <label htmlFor={`check-${colData.name}`}>{colData.name}</label>
                    </DataListCell>
                  ]}
                />
              </>
            ),
            data: colData
          }))}
          onDrop={(_, newItems) => {
            setColumnData(newItems.map((item) => (item as any).data));
          }}
          variant="DataList"
          overlayProps={{ isCompact: true }}
        >
          <DataList aria-label="Table column management" id="table-column-management" isCompact />
        </DragDropSort>
      </ModalBody>
      <ModalFooter>
        <Button key="save" variant="primary" onClick={onSave}>
          Save
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={(event: React.MouseEvent<Element, MouseEvent> | KeyboardEvent) => {
            setColumnData(initialColData);
            handleModalToggle(event);
          }}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );

  const renderLabel = (labelText: string): React.JSX.Element => {
    switch (labelText) {
      case 'PROCESSADO':
        return <Label color="green">{labelText}</Label>;
      case 'CHECKING':
        return <Label color="orange">{labelText}</Label>;
      case 'DELETADO':
        return <Label color="blue">{labelText}</Label>;
      case 'NONE':
        return <Label color="red">{labelText}</Label>;
      default:
        return <></>;
    }
  };

  const toolbarItems = (
    <Fragment>
      <Toolbar id="page-layout-table-column-management-action-toolbar-top">
        <span id="page-layout-table-column-management-action-toolbar-top-select-checkbox-label" hidden>
          Choose one
        </span>
        <ToolbarContent>
          <ToolbarItem>
            <OverflowMenu breakpoint="md">
              <OverflowMenuGroup groupType="button" isPersistent>
                <OverflowMenuItem>
                  <Button variant="primary" onClick={() => setFormUploadOpen(true)} >Adicionar Nota Fiscal</Button>
                </OverflowMenuItem>
                <OverflowMenuItem isPersistent>
                  <Button variant="link" onClick={handleModalToggle}>
                    Configurar Colunas
                  </Button>
                </OverflowMenuItem>
              </OverflowMenuGroup>
            </OverflowMenu>
          </ToolbarItem>
          <ToolbarItem variant="pagination">{renderPagination('top', false)}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <ImageUploadModal
        isOpen={formUploadOpen}
        onClose={() => { setFormUploadOpen(false); fetchData() }} onSubmit={undefined}
      />

    </Fragment>
  );

  async function deletar(row: any): Promise<void> {
    if (!row || !row.id) return;
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/invoices/${row.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Erro ao deletar nota fiscal');
      }
      // Atualiza as linhas removendo o item deletado
      const updatedRows = managedRows.filter((r: any) => r.id !== row.id);
      setManagedRows(updatedRows);
      setDefaultRows(updatedRows);
      setPaginatedRows(updatedRows.slice((page - 1) * perPage, page * perPage - 1));
    } catch (error) {
      console.error('Erro ao deletar:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Fragment>
      {toolbarItems}
      <Table variant="compact" aria-label="Column Management Table">
        <Thead>
          <Tr>
            {managedColumns.map((column, columnIndex) => (
              <Th key={columnIndex}>{column}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {paginatedRows.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              <>
                {Object.entries(row).map(([key, value], idx) =>
                  // eslint-disable-next-line no-nested-ternary
                  key === 'status' ? (
                    <Td width={10} dataLabel="Status" key={`${idx}-${value}`}>
                      {renderLabel(value as string)}
                    </Td>
                  ) : key === 'valor_total' ? (
                    <Td width={10} dataLabel="Valor Total" key={`${idx}-${value}`}>
                       {formatarParaReais(value as number)}
                    </Td>
                  ) : (
                    <Td
                      width={10}
                      dataLabel={key === 'lastModified' ? 'Last modified' : capitalize(key)}
                      key={`${idx}-${value}`}
                    >
                      {value as string}
                    </Td>
                  )
                )}
                <Td width={10} dataLabel="Ação" key={`action-${row}`}>
                  <ConfirmDialog
                    buttonTitle='Excluir'
                    title="Deseja excluir este item?"
                    message="Esta ação é irreversível e excluirá permanentemente o item selecionado."
                    confirmText="Excluir"
                    cancelText="Cancelar"
                    onConfirm={() => deletar(row)}
                    trigger={<Button variant="secondary" ouiaId="Secondary">Excluir</Button>} />
                </Td>
              </>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {renderPagination('bottom', false)}
      {renderModal()}

      {loading && <Block message="Carregando conteúdo..." />}

    </Fragment>
  );
};
