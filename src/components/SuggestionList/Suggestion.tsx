import "./styles/Suggestion.css";

interface ISuggestionProps {
  value: string;
  setSelectedValue: (value: string) => void;
}
const Suggestion = (props: ISuggestionProps) => {
  const {value, setSelectedValue} = props;
  return (
    <div
      className="search-result"
      onClick={() =>setSelectedValue(value)}
    >
      {value}
    </div>
  );
};

export default Suggestion;