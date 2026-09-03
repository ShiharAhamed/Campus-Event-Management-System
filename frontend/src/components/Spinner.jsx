const Spinner = ({ text = 'Loading...' }) => (
  <div className="spinner-wrap">
    <div className="spinner" />
    <p>{text}</p>
  </div>
);

export default Spinner;
