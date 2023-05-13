import { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar/SearchBar';
import SuggestionList from './components/SuggestionList/SuggestionList';

function App() {
  const [suggestionsList, setSuggestionList] = useState<Array<any>>([]);
  const [selectedValue, setSelectedValue] = useState<string>('')
 
  const updateSuggestionList = (list: Array<any>) => {
      setSuggestionList(list);
  }
  const updateSelectedValue = (value: string) => {
    setSelectedValue(value);
  }

  return (
    <div className="App">
      <SearchBar selectedValue={selectedValue} setSuggestionList={updateSuggestionList}/>
      <SuggestionList data={suggestionsList} setSelectedValue={updateSelectedValue}/>
    </div>
  );
}

export default App;
