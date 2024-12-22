import { useState, useEffect } from 'react';
import { Button, Input, Form, Upload, message, Spin, Card, Row, Col, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';


const { Paragraph } = Typography;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [nfts, setNfts] = useState([]);
  const [fetchingNfts, setFetchingNfts] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState({});
  const [metadataUrls, setMetadataUrls] = useState({});


  const handleSubmit = async (values) => {
    const { coberturaVegetal, hectares, atributosEspecificos, corposAgua, nascentes, projetos, car, image } = values;

    if (!image) {
      message.error("Por favor, adicione uma imagem.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image.file);  // Aqui pegamos a imagem do campo 'image' no formulário
    formData.append("coberturaVegetal", coberturaVegetal);
    formData.append("hectares", hectares);
    formData.append("atributosEspecificos", atributosEspecificos);
    formData.append("corposAgua", corposAgua);
    formData.append("nascentes", nascentes);
    formData.append("projetos", projetos);
    formData.append("car", car);


    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/mint-nft`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("NFT gerado com sucesso!");
      console.log(response.data);
      fetchNfts(); // Recarregar os NFTs após a criação de um novo
    } catch (error) {
      message.error("Erro ao gerar NFT.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNfts = async () => {
    setFetchingNfts(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/nfts`);
      setNfts(response.data);
    } catch (error) {
      setError("Erro ao buscar NFTs.");
      console.error(error);
    } finally {
      setFetchingNfts(false);
    }
  };

  function decodeHexToString(hexString) {

    const bytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }

  async function getPinataImageUrl(ipfsHash) {
    try {
      const cleanedHash = ipfsHash.replace(/^ipfs:\/\//, '').replace(/^ipfs:/, '');
      const metadataIPFS = `https://gateway.pinata.cloud/ipfs/${cleanedHash}`;

      const response = await axios.get(metadataIPFS);
      const data = response.data;
      const image = data.image;
      const cleanedImg = image.replace(/^ipfs:\/\//, '').replace(/^ipfs:/, '');
      return `https://gateway.pinata.cloud/ipfs/${cleanedImg}`;

    } catch (error) {
      throw new Error(`Erro ao acessar o IPFS: ${error.message}`);
    }
  }

  useEffect(() => {
    const loadMetadataAndImageUrls = async () => {
      const updatedImageUrls = { ...imageUrls };
      const updatedMetadataUrls = { ...metadataUrls }; // Novo estado para URLs de metadados

      for (const nft of nfts) {
        if (!updatedImageUrls[nft.URI]) {
          const imageUrl = (await getPinataImageUrl(decodeHexToString(nft.URI)));
          updatedImageUrls[nft.URI] = imageUrl;
        }

        if (!updatedMetadataUrls[nft.URI]) {
          const cleanedHash = (decodeHexToString(nft.URI)).replace(/^ipfs:\/\//, '').replace(/^ipfs:/, '');
          const metadataIPFS = `https://gateway.pinata.cloud/ipfs/${cleanedHash}`
          console.log(metadataIPFS)
          updatedMetadataUrls[nft.URI] = metadataIPFS;
        }
      }

      setMetadataUrls(updatedMetadataUrls)
      setImageUrls(updatedImageUrls);
    };

    loadMetadataAndImageUrls();
  }, [nfts]);



  useEffect(() => {
    fetchNfts();
  }, []);

  return (
    <div style={{ padding: '50px' }}>
      <h1>Green Ledger: Emita Seu Certificado de Preservação Ambiental</h1>
      <h3 style={{ color: '#fff' }}>Insira as informações da sua área de preservação para gerar um NFT exclusivo que certifica sua contribuição para a proteção ambiental. Cada certificado é validado e registrado na blockchain XRPL e funciona como pré-requisito para juntar-se à DAO Protetores de Florestas</h3>

      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item label="Cobertura Vegetal (%)" name="coberturaVegetal" rules={[{ required: true, message: 'Por favor, insira a cobertura vegetal!' }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Número de Hectares" name="hectares" rules={[{ required: true, message: 'Por favor, insira o número de hectares!' }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Atributos Específicos" name="atributosEspecificos" rules={[{ required: true, message: 'Por favor, insira os atributos específicos!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Número de Corpos d'Água" name="corposAgua" rules={[{ required: true, message: 'Por favor, insira o número de corpos d\'água!' }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Número de Nascentes" name="nascentes" rules={[{ required: true, message: 'Por favor, insira o número de nascentes!' }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Projetos em Desenvolvimento" name="projetos" rules={[{ required: true, message: 'Por favor, insira os projetos em desenvolvimento!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Registro CAR:" name="car" rules={[{ required: true, message: 'Por favor, insira o registro CAR!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Imagem" name="image" rules={[{ required: true, message: 'Por favor, faça o upload de uma imagem!' }]}>
          <Upload
            name="image"
            beforeUpload={() => false}
            accept="image/*"
            showUploadList={false}
            customRequest={({ onSuccess }) => {
              setTimeout(() => onSuccess(), 0);
            }}
          >
            <Button icon={<UploadOutlined />}>Upload Imagem</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button style={{ background: 'linear-gradient(135deg, #000428, #00FFFF)' }} type="primary" htmlType="submit" loading={loading} block>
            {loading ? <Spin size="small" /> : "Gerar NFT"}
          </Button>
        </Form.Item>
      </Form>

      {/* Marketplace Section */}
      <div style={{ marginTop: '50px' }}>
        <h2>Marketplace - NFTs de Preservação de Áreas Naturais</h2>

        {fetchingNfts ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
            <p>Carregando NFTs...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "red" }}>{error}</div>
        ) : (
          <Row gutter={[16, 16]}>
            {nfts.length > 0 ? (
              nfts.map((nft, index) => (
                <Col span={8} key={index}>
                  <Card
                    hoverable
                    style={{
                      background: 'linear-gradient(135deg, #000428, #00FFFF)',
                    }}
                    onClick={() => window.open(metadataUrls[nft.URI], '_blank')}
                  >
                    <Card.Meta
                      title={nft.name}
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                            {nft.description}
                          </Paragraph>
                          <div style={{ color: '#FFFFFF' }}>
                            <img
                              height={300}
                              src={imageUrls[nft.URI] || 'https://via.placeholder.com/150'}
                            />
                            <div>
                              <strong>ID do NFT: </strong>
                              <span>{nft.nft_serial}</span>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))
            ) : (
              <div style={{ textAlign: "center", width: "100%" }}>
                <p>Nenhum NFT encontrado.</p>
              </div>
            )}

          </Row>
        )}
      </div>
    </div>
  );
};

export default App;
