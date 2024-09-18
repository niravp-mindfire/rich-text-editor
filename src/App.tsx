import React from 'react';
import { Provider } from 'react-redux';
import RichTextEditor from './components/RichTextEditor';
import store from './store/store';
import { Layout } from 'antd';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Layout>
        <Header style={{ color: 'white', fontSize: '24px', textAlign: 'center' }}>
          Rich Text Editor
        </Header>
        <Content style={{ padding: '50px' }}>
          <RichTextEditor />
        </Content>
      </Layout>
    </Provider>
  );
};

export default App;
