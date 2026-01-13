import './LogInput.css';

interface LogInputProps {
  value: string;
  onInput: (value: string) => void;
  onConvert: () => void;
}

const LogInput = (props: LogInputProps) => {
  // Trigger conversion right after paste so users see results immediately.
  const handlePaste = (e: ClipboardEvent) => {
    // Wait for the textarea to update with pasted text, then convert.
    // Use setTimeout to ensure the paste operation has completed
    setTimeout(() => {
      const textarea = e.currentTarget as HTMLTextAreaElement;
      if (textarea) {
        const newValue = textarea.value;
        props.onInput(newValue);
        props.onConvert();
      }
    }, 0);
  };

  const handleInput = (e: Event) => {
    const textarea = e.currentTarget as HTMLTextAreaElement;
    props.onInput(textarea.value);
    // Also trigger conversion on input for immediate feedback
    props.onConvert();
  };

  return (
    <div class="log-input-section">
      <label for="log-input" class="section-label">
        SQL Log Input
      </label>
      <textarea
        id="log-input"
        class="log-input"
        placeholder="Paste your MyBatis logs here...&#10;&#10;Example:&#10;==>  Preparing: select * from users where id = ? and status = ?&#10;==> Parameters: 10(Integer), 'ACTIVE'(String)"
        value={props.value}
        onInput={handleInput}
        onPaste={handlePaste}
        rows={10}
      />
      <button class="convert-button" onClick={props.onConvert}>
        Convert
      </button>
    </div>
  );
};

export default LogInput;
