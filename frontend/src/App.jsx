import { useState, useEffect } from 'react';
import { Button, Input, Form, Upload, message, Spin, Card, Row, Col, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';


const { Title, Paragraph } = Typography;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [nfts, setNfts] = useState([]);
  const [fetchingNfts, setFetchingNfts] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState({});


  const handleSubmit = async (values) => {
    const { coberturaVegetal, hectares, atributosEspecificos, corposAgua, nascentes, projetos, image } = values;

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

    try {
      const response = await axios.post("http://localhost:3000/mint-nft", formData, {
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
      const response = await axios.get("http://localhost:3000/nfts");
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
      const image = response.data.image;
      const cleanedImg = image.replace(/^ipfs:\/\//, '').replace(/^ipfs:/, '');
      return `https://gateway.pinata.cloud/ipfs/${cleanedImg}`;

    } catch (error) {
      throw new Error(`Erro ao acessar o IPFS: ${error.message}`);
    }
  }

  useEffect(() => {
    const loadImages = async () => {
      const updatedImageUrls = { ...imageUrls };
      for (const nft of nfts) {
        if (!updatedImageUrls[nft.URI]) {
          const imageUrl = await getPinataImageUrl(decodeHexToString(nft.URI));
          updatedImageUrls[nft.URI] = imageUrl;
        }
      }
      setImageUrls(updatedImageUrls);
    };

    loadImages();
  }, [nfts]);


  useEffect(() => {
    fetchNfts();
  }, []);

  return (
    <div style={{ padding: '50px' }}>
      <h1>Certificado de Preservação de Áreas Naturais</h1>

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
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? <Spin size="small" /> : "Gerar NFT"}
          </Button>
        </Form.Item>
      </Form>

      {/* Marketplace Section */}
      <div style={{ marginTop: '50px' }}>
        <Title level={2}>Marketplace - NFTs de Preservação de Áreas Naturais</Title>

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
                  >
                    <Card.Meta
                      title={nft.name}
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                            {nft.description}
                          </Paragraph>
                          <div>
                            <img height={300} src={imageUrls[nft.URI] || 'https://via.placeholder.com/150'} />
                            <strong>Atributos:</strong>
                            <ul>
                              {nft.attributes?.map((attr, idx) => (
                                <li key={idx}>
                                  {attr.trait_type}: {attr.value}
                                </li>
                              ))}
                            </ul>
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
