import './ErrorMessage.css';

const ErrorMessage = () => {
  return (
    <div class="error-message">
      No SQL found in the logs. Please check the format.
      <br />
      Expected format: "Preparing: ..." and "Parameters: ..."
    </div>
  );
};

export default ErrorMessage;
