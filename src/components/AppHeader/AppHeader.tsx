import './AppHeader.css';

const AppHeader = () => {
  return (
    <header class="app-header">
      <h1>MyBatis SQL Log Visualizer</h1>
      <p class="subtitle">
        Paste MyBatis JDBC logs to extract and visualize SQL with bound parameters
      </p>
    </header>
  );
};

export default AppHeader;
