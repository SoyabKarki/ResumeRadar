export const styles = {
  container: { 
    padding: '15px', 
    width: '320px', 
    fontFamily: 'Arial, sans-serif', 
    fontSize: '14px' 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: '10px', 
    fontSize: '18px', 
    color: '#333' 
  },
  inputFile: { 
    width: '100%', 
    marginBottom: '6px' 
  },
  small: { 
    fontSize: '12px', 
    color: '#666', 
    marginTop: '-4px', 
    marginBottom: '8px' 
  },
  textarea: { 
    width: '100%', 
    padding: '8px', 
    resize: 'vertical', 
    borderRadius: '4px', 
    border: '1px solid #ccc', 
    marginBottom: '10px' 
  },
  button: { 
    width: '100%', 
    padding: '8px', 
    backgroundColor: '#4CAF50', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer' 
  },
  message: { 
    marginTop: '10px', 
    color: '#d9534f' 
  },
  resultBox: { 
    marginTop: '10px', 
    padding: '8px', 
    backgroundColor: '#f9f9f9', 
    border: '1px solid #ccc', 
    borderRadius: '4px' 
  }
};

export const tagStyle = (tag) => {
  const base = {
    padding: '2px 6px',
    borderRadius: '4px',
    margin: '2px',
    display: 'inline-block',
    fontSize: '12px',
  };
  if (tag.type === 'required' && tag.status === 'matched') return { ...base, background: '#dff0d8', color: '#3c763d' };
  if (tag.type === 'required' && tag.status === 'missing') return { ...base, background: '#f2dede', color: '#a94442' };
  if (tag.type === 'preferred' && tag.status === 'matched') return { ...base, background: '#d9edf7', color: '#31708f' };
  return { ...base, background: '#fcf8e3', color: '#8a6d3b' };
};
