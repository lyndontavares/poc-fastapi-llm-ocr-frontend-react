import React, { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  TextInput,
  FileUpload,
  TextArea,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Content,
  Alert,
  AlertProps,
  AlertGroup,
  AlertActionCloseButton,
  AlertVariant,
  Flex,
  FlexItem
} from '@patternfly/react-core';
import Block from '@app/utils/Block';

export default function ImageUploadModal({ isOpen, onClose, onSubmit }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const [form, setForm] = useState({
    id: '',
    cnpj: '',
    data_emissao: '',
    valor_total: '',
    imagem_hash: '',
    status: 'CHECKING'
  });

  const [alerts, setAlerts] = useState<Partial<AlertProps>[]>([]);
  const addAlert = (title: string, variant: AlertProps['variant'], key: React.Key) => {
    setAlerts((prevAlerts) => [{ title, variant, key }, ...prevAlerts]);
  };
  const removeAlert = (key: React.Key) => {
    setAlerts((prevAlerts) => [...prevAlerts.filter((alert) => alert.key !== key)]);
  };

  function handleChange(name, value) {
    setForm({ ...form, [name]: value });
  }

  async function handleFileChange(_, file) {
    setIsLoading(true);
    setMensagem('Processando extração de dados...');
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    try {
      const payload = new FormData();
      payload.append('file', file);

      const resposta = await fetch('http://127.0.0.1:8000/invoices/extract/check', {
        method: 'POST',
        body: payload,
        /*         headers: {
                  'Content-Type': 'application/json'
                } */
      })
      const json = await resposta.json();
      setForm({
        ...form,
        id: json.id || '',
        cnpj: json.cnpj || '',
        data_emissao: converterData(json.data_emissao) || '',
        valor_total: json.valor_total || '',
        imagem_hash: json.imagem_hash || '',
        status: json.status || 'CHECKING'
      });

    } catch (error) {
      addAlert('Erro ao processar exração de dados.', 'danger', getUniqueId());
    } finally {
      setIsLoading(false);
    }

  }

  function converterData(dataBr) {
    const [dia, mes, ano] = dataBr.split('/');
    if (!dia || !mes || !ano || dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
      throw new Error("Formato de data inválido. Esperado: dd/mm/yyyy");
    }
    return `${ano}-${mes}-${dia}`;
  }

  function handleClearImage() {
    setImageFile(null);
    setImagePreview(null);
    setZoomed(false);
  }

  function handleSubmit() {
    const payload = {
      ...form,
      imagem: imageFile
    };
    onSubmit(payload);
    onClose();
    resetForm();
  }

  function resetForm() {
    setForm({
      id: '',
      cnpj: '',
      data_emissao: '',
      valor_total: '',
      imagem_hash: '',
      status: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setZoomed(false);
  }
  const getUniqueId = () => new Date().getTime();

  function formCheck() {
    if (!form.data_emissao || !form.valor_total || !form.cnpj || !imageFile) {
      addAlert('Preencha todos os campos obrigatórios.', 'warning', getUniqueId());
      return false;
    }
    if (form.status === 'PROCESSADO') {
      addAlert('A nota fiscal já processada e salva na base de dados. Selecione uma nova Nota Fiscal', 'warning', getUniqueId());
      return false;
    }
    return true
  }



  async function salvar() {
    if (!formCheck()) {
      return;
    }

    setMensagem('Salvando...');
    setIsLoading(true);

    const payload = new FormData();
    payload.append('id', '0');
    payload.append('data_emissao', form.data_emissao);
    payload.append('valor_total', form.valor_total);
    payload.append('cnpj', form.cnpj);
    payload.append('imagem_hash', form.imagem_hash);
    payload.append('status', form.status);

    const json = JSON.stringify(Object.fromEntries(payload.entries()));

    try {
      const response = await fetch('http://127.0.0.1:8000/invoices/add', {
        method: 'POST',
        body: json,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(response);

      if (response.ok) {
        addAlert('Salvo com sucesso.', 'success', getUniqueId());
        onClose();
      } else {
        setIsLoading(false)
        addAlert('Erro ao enviar nots fiscal', 'danger', getUniqueId());
      }
    } catch (error) {
      setIsLoading(false)
      console.error(error);
      addAlert('Erro ao enviar nots fiscal', 'danger', getUniqueId());
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };


  return (
    <Modal
      aria-label="Formulário de adicionar nota fiscal"
      isOpen={isOpen}
      onClose={onClose}
    /* actions={[
      <Button key="confirm" variant="primary" onClick={handleSubmit}>
        Enviar
      </Button>,
      <Button key="cancel" variant="link" onClick={onClose}>
        Cancelar
      </Button>
    ]} */
    >

      <ModalHeader
        title="Adicionar Nota Fiscal"
        labelId="basic-modal-title"
        description={
          <Content>
            <p>Faça upload de notas fiscais para extraçõ de dados.</p>
          </Content>
        }
      />

      <ModalBody id="modal-box-body-basic">


        <Form>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {/* Coluna 1: Campos do formulário */}
            <div style={{ flex: 1 }}>
              <FormGroup label="ID" fieldId="id">
                <TextInput
                  readOnly
                  id="id"
                  value={form.id}
                  onChange={(val) => handleChange('id', val)}
                />
              </FormGroup>

              <FormGroup label="CNPJ" fieldId="cnpj">
                <TextInput
                  id="id"
                  value={form.cnpj}
                  onChange={(val) => handleChange('cnpj', val)}
                />
              </FormGroup>

              <FormGroup label="Data de Emissão" fieldId="data_emissao">
                <TextInput
                  id="data_emissao"
                  type="date"
                  value={form.data_emissao}
                  onChange={(val) => handleChange('data_emissao', val)}
                />
              </FormGroup>

              <FormGroup label="Valor Pago" fieldId="valor_total">
                <TextInput
                  id="valor_total"
                  type="number"
                  step="0.01"
                  value={form.valor_total}
                  onChange={(val) => handleChange('valor_total', val)}
                />
              </FormGroup>

              <FormGroup label="Imagem Hash" fieldId="imagem_hash">
                <TextInput
                  readOnly
                  id="imagem_hash"
                  value={form.imagem_hash}
                  onChange={(val) => handleChange('imagem_hash', val)}
                />
              </FormGroup>

              <FormGroup label="Status" fieldId="status">
                <TextInput
                  readOnly
                  id="status"
                  value={form.status}
                  onChange={(val) => handleChange('status', val)}
                />
              </FormGroup>
            </div>

            {/* Coluna 2: Upload e preview */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <FormGroup label="Upload Imagem" fieldId="imagem">
                <FileUpload
                  id="imagem"
                  value={imageFile ? imageFile.name : ''}
                  filename={imageFile?.name}
                  onChange={() => { }}
                  onFileInputChange={handleFileChange}
                  onClearClick={handleClearImage}
                  hideDefaultPreview
                  browseButtonText='Selecione...'
                  filenamePlaceholder='Arraste e solte ou clique para selecionar uma imagem'
                  clearButtonText='Limpar Imagem'

                />
              </FormGroup>

              {imagePreview && (
                <div
                  style={{
                    marginTop: '1rem',
                    cursor: 'zoom-in',
                  }}
                  onClick={() => setZoomed(!zoomed)}
                >
                  <img
                    src={imagePreview}
                    alt="Pré-visualização"
                    style={{
                      maxWidth: zoomed ? '90%' : '200px',
                      maxHeight: zoomed ? '90vh' : '200px',
                      border: '1px solid #ccc',
                      transition: 'transform 0.2s'
                    }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    (Clique para {zoomed ? 'reduzir' : 'ampliar'})
                  </div>
                </div>
              )}
            </div>
          </div>
        </Form>

      </ModalBody>

      <ModalFooter>
        <Button key="save" variant="primary" onClick={() => salvar()}>
          Salvar
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={(event: React.MouseEvent<Element, MouseEvent> | KeyboardEvent) => {
            //setColumnData(initialColData);
            //handleModalToggle(event);
            onClose();
          }}
        >
          Cancelar
        </Button>
      </ModalFooter>

      <AlertGroup hasAnimations isToast isLiveRegion>
        {alerts.map(({ key, variant, title }) => (
          <Alert
            variant={variant as AlertVariant || AlertVariant.info}
            title={title}
            actionClose={
              <AlertActionCloseButton
                title={title as string}
                variantLabel={`${variant} alert`}
                onClose={() => { if (key !== undefined && key !== null) removeAlert(key); }}
              />
            }
            key={key}
          />
        ))}
      </AlertGroup>

      {isLoading && <Block message={mensagem} />}

    </Modal>
  );
}
