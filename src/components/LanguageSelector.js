export const LanguageSelector = ({ value, onChange, ...props }) => {
  return (
    <select value={value} onChange={onChange} id="languageselect" {...props}>
      <option value="">English</option>
      <option value="ru">Russian</option>
      <option value="az">Azerbanjani</option>
    </select>
  );
};
