import * as React from 'react';
import * as moment from 'moment';
import { getRangeDisplayItems, i18nt } from './utils';
import { AggregationMethod, AggregationValueCalculationType, FilterRule, FilterType, RulesType, SortOrder } from './enums';
import { QueryFieldTooltip } from './QueryFieldTooltip';
import { ExpandableItemList, ItemInfo } from '../ExpandableItemList/ExpandableItemList';
import './style.scss';
import { classnames } from '~/utils/utils';

// FieldRenderer接口已移除，现在使用ExpandableItemList的ItemType
// 扩展ItemType以存储字段的完整信息
interface QueryFieldItem extends ItemInfo {
  fieldData?: any; // 原始字段数据
  fieldType?: string; // 字段类型
  hasFilters?: boolean;
  filterSummary?: string;
  secondaryText?: string;
  extraProps?: Record<string, any>;
}

interface SectionConfig {
  key: string;
  title: string;
  fields: any[];
  type: string;
}

interface IProps {
  dimensions: any[];
  measures: any[];
  filters: any[];
  rankings: any[];
  order: Record<string, any>;
  pivotSettingHelper?: any;
  onFieldEdit?: (type: 'dimension' | 'measure' | 'filter', field: any, action: 'remove' | 'edit') => void;
}

interface IState {
  // 移除了expandedSections、sectionsShowToggle、sectionsVisibleCount
  // 这些状态现在由ExpandableItemList组件内部管理
}

export class QueryBuilder extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  // 移除了所有宽度检测相关的方法，这些功能现在由ExpandableItemList组件处理

  /**
   * 将字段列表转换为ExpandableItemList所需的ItemType数组
   */
  private convertFieldsToItems = (fields: any[], sectionType: string): QueryFieldItem[] => {
    if (sectionType === 'queryOption') {
      return fields.map((option, index) => 
        this.createItemType(option.data, option.type, index)
      );
    }
    
    return fields.map((field, index) => 
      this.createItemType(field, sectionType, index)
    );
  };

  private createItemType = (field: any, type: string, index: number): QueryFieldItem => {
    switch (type) {
      case 'dimension':
        return this.renderDimensionField(field, index);
      case 'measure':
      case 'calculation':
        return this.renderMeasureField(field, index, type);
      case 'filter':
        return this.renderFilterField(field, index);
      case 'ranking':
        return this.renderRankingField(field, index);
      case 'order':
        return this.renderOrderField(field, index);
      default:
        return {
          text: i18nt('query.unknown'),
          customCSS: `query-field query-field--${type}`,
          fieldType: type,
        };
    }
  }

  private renderDimensionField = (field: any, index: number): QueryFieldItem => {
    return {
      text: field.display,
      customCSS: 'query-field query-field--dimension',
      fieldData: field,
      fieldType: 'dimension',
    };
  }

  private generateFilterSummary = (filters: any[]): string => {
    try {
      if (!filters || filters.length === 0) return '';

      const filterTexts = filters.map(filter => {
        const displayText = this.renderLogicalFilter(filter);
        return displayText;
      }).filter(text => text && text !== i18nt('query.unknown'));

      if (filterTexts.length === 0) return '';

      if (filterTexts.length === 1) {
        return filterTexts[0];
      }
      if (filterTexts.length <= 3) {
        return filterTexts.join(', ');
      }
      return `${filterTexts.slice(0, 2).join(', ')} ${i18nt('query.andMoreFilters', `+ ${filterTexts.length - 2} 个筛选器`)}`;
    } catch (error) {
      console.error('Error generating filter summary:', error, filters);
      return i18nt('query.filterError');
    }
  }

  private renderMeasureField = (field: any, index: number, type: string): QueryFieldItem => {
    let displayText = '';
    let secondaryText = '';
    let hasFilters = false;
    let filterSummary = '';

    try {
      const { pivotSettingHelper } = this.props;
      const measureField = pivotSettingHelper?.getColumn(field.name);
      const fieldDisplay = measureField?.display;

      displayText = field.display || fieldDisplay;

      if (field.along) {
        if (field.type === AggregationValueCalculationType.Date) {
          const comparisonType = field.along.method;
          const localizedComparison = i18nt(`calculationTypes.date.${comparisonType?.toLowerCase()}`);
          secondaryText = `(${fieldDisplay}${localizedComparison})`;
        } else if (field.type === AggregationValueCalculationType.Group) {
          const localizedGroup = i18nt('calculationTypes.group.accounting');
          secondaryText = `(${fieldDisplay}${localizedGroup})`;
        } else if (field.type === AggregationValueCalculationType.Running) {
          const localizedRunning = i18nt('calculationTypes.running.cumulative') + i18nt(`aggregationMethods.${field.along.method?.toLowerCase()}`);
          secondaryText = `(${fieldDisplay}${localizedRunning})`;
        } else if (field.type === AggregationValueCalculationType.Moving) {
          const localizedMoving = i18nt('calculationTypes.moving.value') + i18nt(`aggregationMethods.${field.along.method?.toLowerCase()}`);
          secondaryText = `(${fieldDisplay}${localizedMoving})`;
        }
      } else if (field.expression) {
        secondaryText = `(${i18nt('query.calculatedField')})`;
      } else if (field.method) {
        const aggregation = field.method;
        const localizedAggregation = i18nt(`aggregationMethods.${aggregation?.toLowerCase()}`);
        secondaryText = `(${field.name}${localizedAggregation})`;
      } else {
        secondaryText = `(${field.name})`;
      }

      if (field.filters && Array.isArray(field.filters) && field.filters.length > 0) {
        hasFilters = true;
        filterSummary = this.generateFilterSummary(field.filters);
      }
      if (field.scopedFilters && Array.isArray(field.scopedFilters) && field.scopedFilters.length > 0) {
        hasFilters = true;
        filterSummary = `${filterSummary} ${this.generateFilterSummary(field.scopedFilters)}`;
      }

      if (!displayText) {
        if (field.along) {
          if (field.type === AggregationValueCalculationType.Date) {
            const comparisonType = field.along.method;
            const localizedComparison = i18nt(`calculationTypes.date.${comparisonType?.toLowerCase()}`);
            displayText = `${fieldDisplay} (${localizedComparison})`;
          } else if (field.type === AggregationValueCalculationType.Group) {
            const localizedGroup = i18nt('calculationTypes.group.accounting');
            displayText = `${fieldDisplay} (${localizedGroup})`;
          } else if (field.type === AggregationValueCalculationType.Running) {
            const localizedRunning = i18nt('calculationTypes.running.cumulative') + i18nt(`aggregationMethods.${field.along.method?.toLowerCase()}`);
            displayText = `${fieldDisplay} (${localizedRunning})`;
          } else if (field.type === AggregationValueCalculationType.Moving) {
            const fieldName = field.display;
            const localizedMoving = i18nt('calculationTypes.moving.value') + i18nt(`aggregationMethods.${field.along.method?.toLowerCase()}`);
            displayText = `${fieldName} (${localizedMoving})`;
          }
        } else if (field.expression) {
          displayText = field.display;
        } else if (field.method) {
          const aggregation = field.method;
          const localizedAggregation = i18nt(`aggregationMethods.${aggregation?.toLowerCase()}`);
          displayText = `${fieldDisplay}${localizedAggregation}`;
        } else {
          displayText = fieldDisplay;
        }
        secondaryText = '';
      }
    } catch (error) {
      console.error('Error rendering measure field:', error, field);
      displayText = i18nt('query.renderError');
      secondaryText = '';
    }

    const handleClick = () => {
      if (this.props.onFieldEdit) {
        this.props.onFieldEdit('measure', field, 'edit');
      }
    };

    return {
      text: displayText,
      customCSS: `query-field query-field--${type}`,
      onClick: handleClick,
      fieldData: field,
      fieldType: type,
      secondaryText,
      hasFilters,
      filterSummary,
    };
  }

  private renderFilterField = (filter: any, index: number): QueryFieldItem => {
    const displayText = this.renderLogicalFilter(filter);
    return {
      text: `${i18nt('filter.prefix')} ${displayText}`,
      customCSS: 'query-field query-field--filter',
      fieldData: filter,
      fieldType: 'filter',
    };
  }

  private renderRankingField = (ranking: any, index: number): QueryFieldItem => {
    const displayText = this.renderRankingItem(ranking);
    return {
      text: displayText,
      customCSS: ranking.rank ? 'query-field query-field--ranking' : 'query-field query-field--ranking-filter',
      fieldData: ranking,
      fieldType: 'ranking',
    };
  }

  private renderOrderField = (orderData: any, index: number): QueryFieldItem => {
    const { pivotSettingHelper } = this.props;
    const orderKeys = Object.keys(orderData);
    let displayText = i18nt('query.unknown');
    let title = displayText;
    const extraProps: Record<string, any> = {};

    if (orderKeys.length > 0) {
      const key = orderKeys[0];
      const orderItem = orderData[key];

      let fieldName = '';
      let aggregationType = '';
      if (orderItem.sortBy && orderItem.sortBy.measure) {
        fieldName = orderItem.sortBy.measure.name;
        aggregationType = orderItem.sortBy.measure.method;
      } else if (orderItem.columnName) {
        fieldName = orderItem.columnName;
      }

      let fieldDisplay = fieldName;
      const orderField = pivotSettingHelper?.getColumn(fieldName);
      if (orderField) {
        fieldDisplay = (aggregationType && aggregationType !== AggregationMethod.None)
          ? `${orderField.display}${i18nt(`aggregationMethods.${aggregationType?.toLowerCase()}`)}`
          : orderField.display;
      } else {
        console.warn('field not found in pivot setting when render order field:', fieldName);
      }

      displayText = `${i18nt('order.prefix')} ${fieldDisplay}`;

      const order = orderItem.order;
      const direction = order === SortOrder.Descending ? 'desc' : 'asc';
      extraProps['data-direction'] = direction;

      const orderType = order === SortOrder.Descending ?
        i18nt('order.orderTypes.desc') :
        i18nt('order.orderTypes.asc');
      title = `${i18nt('order.prefix')}${fieldDisplay}${orderType}`;
    }

    return {
      text: displayText,
      customCSS: 'query-field query-field--order',
      title,
      fieldData: orderData,
      fieldType: 'order',
      extraProps,
    };
  }

  private renderLogicalFilter = (filter: any): string => {
    if (!filter) return i18nt('query.unknown');

    if (filter.type === 'and' || filter.type === 'or') {
      const operator = i18nt(`filter.groups.${filter.type}`);
      const itemTexts = (filter.items || [])
        .map(item => this.renderLogicalFilter(item))
        .filter(text => text);

      if (itemTexts.length === 0) return i18nt('query.unknown');
      if (itemTexts.length === 1) return itemTexts[0];
      return `(${itemTexts.join(` ${operator} `)})`;
    }

    return this.renderFilterItem(filter);
  }

  private renderFilterItem = (filter: any): string => {
    const { pivotSettingHelper } = this.props;
    try {
      if (!filter) return i18nt('query.unknown');

      const columnNames = filter?.columnNames;
      if (!columnNames || !Array.isArray(columnNames) || columnNames.length === 0) {
        return i18nt('query.unknown');
      }

      const columns = this.getFilterColumns(columnNames, pivotSettingHelper);
      const column = columns[0];
      const { rule, type, range, exclude } = filter;

      switch (rule) {
        case FilterRule.GENERAL:
          return this.renderGeneralFilter(column, range, exclude);
        case FilterRule.VALUE_RANGE:
          return this.renderValueRangeFilter(column, range);
        case FilterRule.WILDCARD:
          return this.renderWildcardFilter(column, type, range, exclude);
        case FilterRule.DATE_RANGE:
          return this.renderDateRangeFilter(column, range);
        case FilterRule.RELATIVE_DATE:
          return this.renderRelativeDateFilter(column);
        default:
          return this.renderDefaultFilter(column, range);
      }
    } catch (error) {
      console.error('Error rendering filter item:', error, filter);
      return i18nt('query.filterError');
    }
  }

  private getFilterColumns = (columnNames: string[], pivotSettingHelper: any) => {
    let columns = [];
    if (pivotSettingHelper) {
      try {
        columns = columnNames.map(name => pivotSettingHelper.getColumn(name)).filter(Boolean);
      } catch (e) {
        console.warn('Failed to get column info:', e);
      }
    }
    return columns.length > 0 ? columns : [{ display: columnNames[0], formatValue: (v) => v }];
  }

  private renderGeneralFilter = (column: any, range: any, exclude: boolean) => {
    if (range?.items) {
      const renderCount = Math.min(range.items.length, 10);
      const { items, hasEllipsis } = getRangeDisplayItems(range.items, [column], renderCount);
      const itemsText = items.join(', ');
      const ellipsis = hasEllipsis ? '...' : '';

      if (items.length <= 1) {
        const ruleDisplay = exclude ? i18nt('filter.rules.notEquals') : i18nt('filter.rules.equals');
        return `${column.display} ${ruleDisplay} ${itemsText}`;
      }
      const ruleDisplay = exclude ? i18nt('filter.rules.notIn') : i18nt('filter.rules.in');
      return `${column.display} ${ruleDisplay} (${itemsText}${ellipsis})`;
    }
    return `${column.display} ${i18nt('filter.rules.equals')} (${i18nt('query.empty')})`;
  }

  private renderValueRangeFilter = (column: any, range: any) => {
    const { min, max, minIncluded, maxIncluded } = range || {};
    if (min != null && max != null) {
      const minOp = minIncluded ? i18nt('filter.rules.greaterThanOrEquals') : i18nt('filter.rules.greaterThan');
      const maxOp = maxIncluded ? i18nt('filter.rules.lessThanOrEquals') : i18nt('filter.rules.lessThan');
      return `${min} ${minOp} ${column.display} ${maxOp} ${max}`;
    }
    if (min != null) {
      const op = minIncluded ? i18nt('filter.rules.greaterThanOrEquals') : i18nt('filter.rules.greaterThan');
      return `${column.display} ${op} ${min}`;
    }
    if (max != null) {
      const op = maxIncluded ? i18nt('filter.rules.lessThanOrEquals') : i18nt('filter.rules.lessThan');
      return `${column.display} ${op} ${max}`;
    }
    return `${column.display} ${i18nt('query.rangeFilter')}`;
  }

  private renderWildcardFilter = (column: any, type: any, range: any, exclude: boolean) => {
    const pattern = range?.pattern || '';
    switch (type) {
      case FilterType.CONTAIN:
        return exclude ? `${column.display} ${i18nt('filter.rules.notContains')} "${pattern}"` : `${column.display} ${i18nt('filter.rules.contains')} "${pattern}"`;
      case FilterType.STARTWITH:
        return exclude ? `${column.display} ${i18nt('filter.rules.notStartsWith')} "${pattern}"` : `${column.display} ${i18nt('filter.rules.startsWith')} "${pattern}"`;
      case FilterType.ENDWITH:
        return exclude ? `${column.display} ${i18nt('filter.rules.notEndsWith')} "${pattern}"` : `${column.display} ${i18nt('filter.rules.endsWith')} "${pattern}"`;
      default:
        return exclude ? `${column.display} ${i18nt('filter.rules.notEquals')} "${pattern}"` : `${column.display} ${i18nt('filter.rules.equals')} "${pattern}"`;
    }
  }

  private renderDateRangeFilter = (column: any, range: any) => {
    const { min, max } = range || {};
    if (min && max) {
      const isDateOnly = column.dataType === 'date';
      const dateFormat = i18nt('common.dateFormat');
      const format = isDateOnly ? dateFormat : `${dateFormat} HH:mm:ss`;
      const formattedMin = moment(min).format(format);
      const formattedMax = moment(max).format(format);
      return `${column.display} ${i18nt('filter.from')} ${formattedMin} ${i18nt('filter.to')} ${formattedMax}`;
    }
    return `${column.display} ${i18nt('query.dateRange')}`;
  }

  private renderRelativeDateFilter = (column: any) => {
    return `${column.display} ${i18nt('query.relativeDate')}`;
  }

  private renderDefaultFilter = (column: any, range: any) => {
    const firstValue = range?.items?.[0]?.value || range?.min || range?.pattern || i18nt('query.condition');
    return `${column.display} ${i18nt('filter.rules.equals', '=')} ${firstValue}`;
  }

  private renderRankingRank = (rank: any, along: any, pivotSettingHelper: any, methodText: string) => {
    const { range, rankOrder } = rank;
    const { min, max } = range;
    let rangeText = '';

    if (min === 0 || min === max) {
      if (rankOrder === SortOrder.Ascending) {
        rangeText = i18nt('ranking.value.top', { max });
      } else {
        rangeText = i18nt('ranking.value.bottom', { max });
      }
    } else {
      rangeText = i18nt('ranking.value.range', { min, max });
    }

    if (along && along.dimension) {
      const alongField = pivotSettingHelper?.getColumn(along.dimension);
      const alongFieldDisplay = alongField?.display || along.dimension;
      return `${i18nt('ranking.orderBy')} ${methodText} ${i18nt('ranking.show')} ${alongFieldDisplay} ${i18nt('ranking.of')} ${rangeText}`;
    }
  }

  private renderRankingFilter = (filter: any, along: any, pivotSettingHelper: any, methodText: string) => {
    const { range = {}, conditionRule } = filter;
    const { min, max } = range;

    let ruleText = '';
    switch (conditionRule) {
      case RulesType.Equal:
        ruleText = i18nt('filter.rules.equals');
        break;
      case RulesType.NotEqual:
        ruleText = i18nt('filter.rules.notEquals');
        break;
      case RulesType.Greater:
        ruleText = i18nt('filter.rules.greaterThan');
        break;
      case RulesType.EqualOrGreater:
        ruleText = i18nt('filter.rules.greaterThanOrEquals');
        break;
      case RulesType.Less:
        ruleText = i18nt('filter.rules.lessThan');
        break;
      case RulesType.EqualOrLess:
        ruleText = i18nt('filter.rules.lessThanOrEquals');
        break;
      case RulesType.Between:
        ruleText = i18nt('filter.rules.between');
        break;
      case RulesType.NotBetween:
        ruleText = i18nt('filter.rules.notBetween');
        break;
      default:
        ruleText = i18nt('filter.rules.unknown');
        break;
    }

    let rangeText = '';
    if (min != null && max != null) {
      rangeText = `${ruleText} (${min} ~ ${max})`;
    } else if (min != null) {
      rangeText = `${ruleText} ${min}`;
    } else if (max != null) {
      rangeText = `${ruleText} ${max}`;
    }

    return `${i18nt('filter.prefix')} ${methodText} ${rangeText}`;
  }

  private renderRankingItem = (ranking: any) => {
    try {
      const { pivotSettingHelper } = this.props;
      if (!ranking) return i18nt('query.unknown');

      const { sortBy, rank, along, filter } = ranking;

      let sortFieldName = i18nt('query.unknownField');
      if (sortBy?.measure?.name) {
        sortFieldName = sortBy.measure.name;
      }

      let sortFieldDisplay = sortFieldName;
      const sortField = pivotSettingHelper?.getColumn(sortFieldName);
      if (sortField) {
        sortFieldDisplay = sortField.display;
      } else {
        console.warn('field not found in pivot setting when render ranking item:', sortFieldName);
      }
      let methodText = sortFieldDisplay;
      const method = sortBy?.measure?.method;
      if (method && method !== AggregationMethod.None) {
        const localizedMethod = i18nt(`aggregationMethods.${method?.toLowerCase()}`);
        methodText = `${sortFieldDisplay}${localizedMethod}`;
      }

      if (rank && rank.range) {
        return this.renderRankingRank(rank, along, pivotSettingHelper, methodText);
      }
      if (filter && filter.range) {
        return this.renderRankingFilter(filter, along, pivotSettingHelper, methodText);
      }

      return i18nt('query.unknown');
    } catch (error) {
      console.error('Error rendering ranking item:', error, ranking);
      return i18nt('query.rankingError');
    }
  }

  private getSectionConfigs = (): SectionConfig[] => {
    const { dimensions, measures, filters, rankings, order } = this.props;
    const configs: SectionConfig[] = [];

    const regularMeasures = measures?.filter(m => !m.type || m.type !== 'calculation') || [];
    const calculations = measures?.filter(m => m.type === 'calculation') || [];

    if (dimensions && dimensions.length > 0) {
      configs.push({
        key: 'dimensions',
        title: i18nt('chat.dimensions'),
        fields: dimensions,
        type: 'dimension',
      });
    }

    if (regularMeasures && regularMeasures.length > 0) {
      configs.push({
        key: 'measures',
        title: i18nt('chat.measures'),
        fields: regularMeasures,
        type: 'measure',
      });
    }

    if (calculations && calculations.length > 0) {
      configs.push({
        key: 'calculations',
        title: i18nt('chat.calculations'),
        fields: calculations,
        type: 'calculation',
      });
    }

    const queryOptions = [];
    if (filters && filters.length > 0) {
      queryOptions.push(...filters.map(filter => ({ type: 'filter', data: filter })));
    }
    if (rankings && rankings.length > 0) {
      queryOptions.push(...rankings.map(ranking => ({ type: 'ranking', data: ranking })));
    }
    if (order && Object.keys(order).length > 0) {
      queryOptions.push({ type: 'order', data: order });
    }

    if (queryOptions.length > 0) {
      configs.push({
        key: 'queryOptions',
        title: i18nt('chat.queryOptions'),
        fields: queryOptions,
        type: 'queryOption',
      });
    }

    return configs;
  }

  /**
   * 渲染QueryField，用于ExpandableItemList的renderItem prop
   */
  private renderQueryField = (item: ItemInfo, index: number, isLastField: boolean, baseCSS: string): React.ReactNode => {
    const queryItem = item as QueryFieldItem;

    const itemCSS = classnames(baseCSS, queryItem.customCSS);
    
    return (
      <QueryFieldTooltip
        title={queryItem.title || queryItem.text}
        displayText={queryItem.text}
        filterSummary={queryItem.filterSummary}
        filterLabel={i18nt('query.fieldFilters')}
        disabled={!queryItem.title && !queryItem.filterSummary}
      >
        <span
          className={itemCSS}
          onClick={queryItem.onClick}
          {...queryItem.extraProps}
        >
          <span className="query-field__primary">{queryItem.text}</span>
          {queryItem.secondaryText && (
            <span className="query-field__secondary">{queryItem.secondaryText}</span>
          )}
          {queryItem.hasFilters && (
            <span className="query-field__filter-indicator">●</span>
          )}
        </span>
      </QueryFieldTooltip>
    );
  }

  private renderFieldSection = (config: SectionConfig) => {
    // 将字段转换为ExpandableItemList所需的ItemType数组
    const items = this.convertFieldsToItems(config.fields, config.type);

    return (
      <div className="query-builder__section" key={config.key}>
        <div className="query-builder__section-header">
          <span className="query-builder__section-title">{config.title}:</span>
        </div>
        <div className="query-builder__fields">
          <ExpandableItemList 
            items={items} 
            renderItem={this.renderQueryField}
            separator={{ text: ',', customCSS: 'query-separator' }}
          />
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const sectionConfigs = this.getSectionConfigs();

    if (sectionConfigs.length === 0) {
      return null;
    }

    return (
      <div className="query-builder">
        {sectionConfigs.map(config => this.renderFieldSection(config))}
      </div>
    );
  }
}
