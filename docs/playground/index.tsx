import React, { useCallback, useMemo, useState } from "react";
import FormRender, { useForm } from 'form-render';
import debounce from 'lodash/debounce';
import Editor from "@monaco-editor/react";
import Controller from "./controller";
import { Divider } from 'antd';
// @ts-ignore
import { serializeToDraft, deserialize } from 'fr-generator';
import AsyncSelect from "./customized/AsyncSelect";

const Playground = () => {
  const form = useForm();
  const [value, setValue] = useState("");
  const [displayType, setDisplayType] = useState('column');
  const [column, setColumn] = useState(1);
  const [readonly, setReadonly] = useState(false);
  const [labelWidth, setLabelWidth] = useState(100);
  const [lang, setLang] = useState('json');

  const onEditorChange = (val?: string) => {
    if (val) {
      setValue(val);
    }
  }


  const parseSchema = (str: string) => {
    try {
      if (lang === 'javascript') {
        return deserialize(str);
      } else {
        return JSON.parse(str)
      }
    } catch (e) {
      return {}
    }
  }

  const onControllerChange = (val) => {
    if (val.schema) {
      try {
        const schema = require(`./json/${val.schema}.json`);
        setValue(JSON.stringify(schema.schema, null, '\t'))
        setLang('json');
      } catch {
        const schema = require(`./json/${val.schema}.js`);
        setLang('javascript')
        setValue(serializeToDraft(schema.schema))
      }
    }

    if (val.displayType) {
      setDisplayType(val.displayType);
    }

    if (val.column) {
      setColumn(val.column)
    }

    if (typeof val.readonly === 'boolean') {
      // TODO 不生效
      setReadonly(val.readonly);
    }

    if (val.labelWidth) {
      setLabelWidth(val.labelWidth);
    }
  }

  const debounceEditorChange = useCallback(debounce(onEditorChange, 200), [])
  const schema = useMemo(() => parseSchema(value), [value, lang]);

  return (
    <div className="fr-playground">
      <Controller onChange={onControllerChange} />
      <Divider />
      <div className="flex">
        <div style={{ flexBasis: '50%' }}>
          <Editor
            value={value}
            height="100%"
            language={lang}
            onChange={debounceEditorChange}
            onMount={() => {
              const schema = require(`./json/simplest.json`);
              setValue(JSON.stringify(schema.schema, null, '\t'))
            }}
          />
        </div>
        <div style={{ flexBasis: '50%', padding: 20 }}>
          <FormRender
            form={form}
            schema={schema}
            displayType={displayType}
            column={column}
            readOnly={readonly}
            labelWidth={labelWidth}
            widgets={{ asyncSelect: AsyncSelect }}
          />
        </div>
      </div>
    </div>
  );
};

export default Playground;