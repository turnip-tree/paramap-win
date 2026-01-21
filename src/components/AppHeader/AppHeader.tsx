import './AppHeader.css';

const AppHeader = () => {
  return (
    <header class="app-header">
      <h1>MyBatis SQL Log Visualizer</h1>
      <p class="subtitle">
        MyBatis JDBC ログを貼り付けて、SQL とパラメーターをマッピングします
      </p>
    </header>
  );
};

export default AppHeader;
