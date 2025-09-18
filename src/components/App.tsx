import * as React from 'react';
import './App.scss';

import testData from './QueryBuilder/data.json';
import { QueryBuilder } from './QueryBuilder/QueryBuilder';
import { PivotSettingHelper } from './QueryBuilder/PivotSettingHelper';
import { ExpandableItemList } from './ExpandableItemList/ExpandableItemList';

export type IAppProps = Record<string, unknown>;

type IAppState = {
  value?: string;
  items: string[];
};

export class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {
      value: '',
      items: [
        'React',
        'TypeScript',
        'Webpack',
        'SCSS',
        'JavaScript',
        'HTML',
        'CSS',
        'Node.js',
        'Express',
        'MongoDB',
        'PostgreSQL',
        'Redis',
        'Docker',
        'Kubernetes',
        'AWS',
        'Azure',
        'Git',
        'GitHub',
        'CI/CD',
        'Testing',
        'Jest',
        'Cypress',
        'Storybook',
        'ESLint',
        'Prettier'
      ]
    };
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    this.setState(() => ({ value }));
  };

  render() {
    const { value, items } = this.state;
    const props: any = testData;
    props.pivotSettingHelper = new PivotSettingHelper(props.pivotSettingHelper);
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="img-container">Test React</div>
        <input
          type="text"
          value={value}
          onChange={this.handleChange}
          placeholder="输入搜索内容..."
          style={{ 
            width: '100%', 
            padding: '8px', 
            margin: '20px 0',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        
        <div style={{ margin: '20px 0', width: '430px', fontSize: '16px', backgroundColor: 'lightblue' }} className="wyn-smart-analyzer">
          <QueryBuilder {...props} />
        </div>
        
        <div style={{ margin: '20px 0', width: '430px', fontSize: '16px', backgroundColor: 'lightblue' }} className="wyn-smart-analyzer">
          <ExpandableItemList items={items.map(item => ({ text: item }))} />
        </div>
      </div>
    );
  }
}
