import * as React from 'react';
import { classnames } from '~/utils/utils';
import './ExpandableItemList.scss';

export type ItemInfo = {
  text: string;
  customCSS?: string;
  title?: string;
  onClick?: () => void;
}

/**
 * ExpandableItemList 组件的属性接口
 */
export type ExpandableItemListProps = {
  /** 要显示的item列表 */
  items: ItemInfo[];
  itemGap?: number;
  /** 自定义展开按钮配置 */
  expandButton?: {
    expandText: string;
    collapseText: string;
    title?: string;
    customCSS?: string;
  };
  /** 自定义分隔符配置 */
  separator: {
    text?: string;
    customCSS?: string;
  };
  /** 自定义item渲染函数 */
  renderItem?: (item: ItemInfo, index: number, isLastField: boolean, baseCSS: string) => React.ReactNode;
}

/**
 * ExpandableItemList 组件的状态接口
 */
export type ExpandableItemListState = {
  /** 是否处于展开状态 */
  expanded: boolean;
  /** 是否显示展开按钮 */
  showExpandButton: boolean;
  /** 可见的item数量 */
  visibleItemCount: number;
  /** 展开按钮的宽度 */
  expandButtonWidth: number;
}

/**
 * ExpandableItemList 组件
 * 
 * 功能特性：
 * - 水平排布显示所有items
 * - 自动检测容器宽度，超出时显示展开按钮和省略号
 * - 点击展开按钮后items自动换行显示
 * - 响应式设计，支持窗口大小变化
 * - 支持自定义分隔符（文本和样式类名）
 * - 支持自定义item渲染函数
 * - 支持自定义展开按钮（文本、标题、样式类名）
 */
export class ExpandableItemList extends React.PureComponent<ExpandableItemListProps, ExpandableItemListState> {

  static defaultProps = {
    itemGap: 4,
    separator: {
      text: ',',
    },
    expandButton: {
      expandText: 'Expand',
      collapseText: 'Collapse'
    }
  };

  // DOM引用
  private containerRef = React.createRef<HTMLDivElement>();
  private contentRef = React.createRef<HTMLDivElement>();
  
  // 响应式监听器
  private resizeObserver?: ResizeObserver;

  constructor(props: ExpandableItemListProps) {
    super(props);
    
    this.state = {
      expanded: false,
      showExpandButton: false,
      visibleItemCount: props.items.length,
      expandButtonWidth: 0
    };
  }

  componentDidMount(): void {
    this.checkContainerWidth();
    this.setupResizeObserver();
  }

  componentDidUpdate(prevProps: ExpandableItemListProps): void {
    if (prevProps.items !== this.props.items) {
      // 如果items发生变化，重置展开状态并重新计算
      this.setState({ expanded: false }, () => {
        this.checkContainerWidth();
      });
    }
  }

  componentWillUnmount(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * 设置ResizeObserver监听容器大小变化
   */
  private setupResizeObserver = (): void => {
    if (typeof ResizeObserver !== 'undefined' && this.containerRef.current) {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkContainerWidth();
      });
      this.resizeObserver.observe(this.containerRef.current);
    }
  };

  /**
   * 检查容器宽度并更新显示状态
   * @param forceCheck 是否强制检查（用于收起时重新计算）
   */
  private checkContainerWidth = (forceCheck: boolean = false): void => {
    const container = this.containerRef.current;
    const content = this.contentRef.current;
    
    if (!container || !content) return;
    
    // 如果已经展开且不是强制检查，不需要重新计算宽度
    if (this.state.expanded && !forceCheck) {
      return;
    }
    
    const containerWidth = container.offsetWidth;
    const allItemsWidth = this.calculateAllItemsWidth();
    
    if (allItemsWidth <= containerWidth) {
      // 所有items都能显示，隐藏展开按钮
      this.setState({
        showExpandButton: false,
        visibleItemCount: this.props.items.length,
        expanded: false
      });
    } else {
      // 需要显示展开按钮，计算可见item数量
      const { visibleCount, expandButtonWidth } = this.calculateVisibleItems(containerWidth, true);
      this.setState({
        showExpandButton: true,
        visibleItemCount: visibleCount,
        expandButtonWidth: expandButtonWidth
      });
    }
  };

  private createTempElement = (): HTMLDivElement => {
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    this.contentRef.current.appendChild(tempElement);
    return tempElement;
  };
  private getTempElementWidth = (tempElement: HTMLDivElement, text: string, className: string): number => {
    tempElement.className = classnames(className);
    tempElement.textContent = text;
    const width = tempElement.offsetWidth;
    return width;
  };
  /**
   * 计算所有items的总宽度
   * @returns 所有items的总宽度（包含间距）
   */
  private calculateAllItemsWidth = (): number => {
    const items = this.props.items;
    const gap = this.props.itemGap;
    
    // 创建临时元素测量宽度
    const tempElement = this.createTempElement();
    
    // 测量分隔符宽度
    const separatorWidth = this.getTempElementWidth(tempElement, this.props.separator.text, classnames('separator', this.props.separator.customCSS));
    
    let totalWidth = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemWidth = this.getTempElementWidth(tempElement, item.text, classnames('item', item.customCSS));

      // 计算item宽度 + gap + 分隔符宽度
      const itemGap = i > 0 ? gap : 0;
      const itemSeparator = i > 0 ? separatorWidth : 0;
      totalWidth += itemWidth + itemGap + itemSeparator;
    }
    
    this.contentRef.current.removeChild(tempElement);
    return totalWidth;
  };

  /**
   * 计算容器内可以显示的item数量
   * @param containerWidth 容器宽度
   * @param showExpandButton 是否需要显示展开按钮
   * @returns 包含可见item数量和展开按钮宽度的对象
   */
  private calculateVisibleItems = (containerWidth: number, showExpandButton: boolean): { visibleCount: number; expandButtonWidth: number } => {
    if (!this.contentRef.current) return { visibleCount: this.props.items.length, expandButtonWidth: 0 };
    
    const items = this.props.items;
    const gap = this.props.itemGap;
    
    let totalWidth = 0;
    let visibleCount = 0;
    
    // 创建临时元素测量宽度
    const tempElement = this.createTempElement();

    // 测量分隔符宽度
    const separatorWidth = this.getTempElementWidth(tempElement, this.props.separator.text, classnames('separator', this.props.separator.customCSS));
    
    // 测量展开按钮和省略号的宽度
    let expandButtonWidth = 0;
    let ellipsisWidth = 0;
    
    if (showExpandButton) {
      // 测量展开按钮宽度
      expandButtonWidth = this.getTempElementWidth(tempElement, this.props.expandButton.expandText, classnames('expand-button', this.props.expandButton?.customCSS));
      
      // 测量省略号宽度
      ellipsisWidth = this.getTempElementWidth(tempElement, '...', classnames('ellipsis', this.props.separator.customCSS));
    }
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemWidth = this.getTempElementWidth(tempElement, item.text, classnames('item', item.customCSS));
      
      // 计算当前item需要的总宽度：item宽度 + gap + 分隔符宽度
      const itemGap = visibleCount > 0 ? gap : 0;
      const itemSeparator = visibleCount > 0 ? separatorWidth : 0;
      const neededWidth = totalWidth + itemWidth + itemGap + itemSeparator;
      
      // 计算剩余可用宽度：容器宽度 - 展开按钮宽度 - 省略号宽度 - 省略号前分隔符宽度
      const ellipsisSeparator = showExpandButton ? separatorWidth : 0;
      const remainingWidth = containerWidth - (showExpandButton ? expandButtonWidth + ellipsisWidth + ellipsisSeparator : 0);
      
      if (neededWidth <= remainingWidth) {
        totalWidth = neededWidth;
        visibleCount++;
      } else {
        break;
      }
    }
    
    this.contentRef.current.removeChild(tempElement);
    return {
      visibleCount: Math.max(0, visibleCount),
      expandButtonWidth: expandButtonWidth
    };
  };

  /**
   * 处理展开/收起按钮点击事件
   */
  private handleExpandClick = (): void => {
    const { expanded } = this.state;
    
    if (expanded) {
      // 从展开状态切换到收起状态
      this.setState({ expanded: false }, () => {
        // 使用setTimeout确保DOM完全更新后再计算宽度
        setTimeout(() => {
          this.checkContainerWidth(true);
        }, 100);
      });
    } else {
      // 从收起状态切换到展开状态
      this.setState({ expanded: true });
    }
  };

  /**
   * 渲染items列表
   * @returns items的React节点数组
   */
  private renderItems = (): React.ReactNode[] => {
    const { items, renderItem, separator } = this.props;
    const { expanded, visibleItemCount } = this.state;
    
    const itemsToRender = expanded ? items : items.slice(0, visibleItemCount);
    
    return itemsToRender.map((item, index) => {
      const isLastField = index === itemsToRender.length - 1;

      return (
        <React.Fragment key={index}>
          {index > 0 && (
            this.renderSeparator()
          )}
          {renderItem ? (
            renderItem(item, index, isLastField, 'item')
          ) : (
            <span
              className={classnames('item', item.customCSS)}
              title={item.title}
              onClick={item.onClick}
            >
              {item.text}
            </span>
          )}
        </React.Fragment>
      );
    });
  };

  private renderSeparator = (): React.ReactNode => {
    const { separator } = this.props;
    return (
      <span className={classnames('separator', separator.customCSS)}>
        {separator.text}
      </span>
    );
  };

  /**
   * 渲染省略号
   * @returns 省略号的React节点或null
   */
  private renderEllipsis = (): React.ReactNode => {
    const { separator } = this.props;
    const { expanded, showExpandButton } = this.state;
    
    if (expanded || !showExpandButton) return null;
    
    const css = classnames('separator', separator.customCSS);
    return (
      <React.Fragment>
        {this.renderSeparator()}
        <span className="ellipsis">...</span>
      </React.Fragment>
    );
  };

  render(): React.ReactNode {
    const { expandButton } = this.props;
    const { expanded, showExpandButton, expandButtonWidth } = this.state;
    const containerClassName = `expandable-items ${expanded ? 'expandable-items--expanded' : ''}`;
    
    // 使用自定义的expandButton配置或默认值
    const buttonText = expanded ? expandButton.collapseText : expandButton.expandText;
    const buttonTitle = expandButton?.title || buttonText;
    const buttonClassName = classnames('expand-button', expandButton.customCSS);
    
    // 设置CSS变量用于动态padding
    const itemListStyle = showExpandButton && !expanded ? {
      paddingRight: `${expandButtonWidth + 8}px` // 展开按钮宽度 + 8px边距
    } : {};
    
    return (
      <div ref={this.containerRef} className={containerClassName}>
        <div ref={this.contentRef} className="item-list" style={itemListStyle}>
          {this.renderItems()}
          {this.renderEllipsis()}
          {showExpandButton && (
            <div 
              className={buttonClassName} 
              onClick={this.handleExpandClick}
              title={buttonTitle}
            >
              {buttonText}
            </div>
          )}
        </div>
      </div>
    );
  }
}