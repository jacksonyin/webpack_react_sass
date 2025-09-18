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
    separator: {
      text: ',',
    },
    expandButton: {
      expandText: '展开',
      collapseText: '收起'
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
      visibleItemCount: props.items.length
    };
  }

  componentDidMount(): void {
    this.checkContainerWidth();
    this.setupResizeObserver();
    window.addEventListener('resize', this.handleResize);
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
    window.removeEventListener('resize', this.handleResize);
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
   * 处理窗口大小变化事件（防抖处理）
   */
  private handleResize = (): void => {
    setTimeout(() => {
      // 如果已经展开，不需要重新计算宽度
      if (!this.state.expanded) {
        this.checkContainerWidth();
      }
    }, 100);
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
      const visibleCount = this.calculateVisibleItems(containerWidth, true);
      this.setState({
        showExpandButton: true,
        visibleItemCount: visibleCount
      });
    }
  };

  /**
   * 计算所有items的总宽度
   * @returns 所有items的总宽度（包含间距）
   */
  private calculateAllItemsWidth = (): number => {
    const items = this.props.items;
    const gap = 8; // item 间距
    
    // 创建临时元素测量宽度
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    this.contentRef.current.appendChild(tempElement);
    
    let totalWidth = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      tempElement.className = classnames('item-item', item.customCSS);
      tempElement.textContent = item.text;
      const itemWidth = tempElement.offsetWidth;
      totalWidth += itemWidth + (i > 0 ? gap : 0);
    }
    
    this.contentRef.current.removeChild(tempElement);
    return totalWidth;
  };

  /**
   * 计算容器内可以显示的item数量
   * @param containerWidth 容器宽度
   * @param showExpandButton 是否需要显示展开按钮
   * @returns 可以显示的item数量
   */
  private calculateVisibleItems = (containerWidth: number, showExpandButton: boolean): number => {
    if (!this.contentRef.current) return this.props.items.length;
    
    const items = this.props.items;
    const expandButtonWidth = 60; // 展开按钮预估宽度
    const ellipsisWidth = 20; // 省略号预估宽度
    const gap = 8; // item 间距
    
    let totalWidth = 0;
    let visibleCount = 0;
    
    // 创建临时元素测量宽度
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    this.contentRef.current.appendChild(tempElement);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      tempElement.className = classnames('item-item', item.customCSS);
      tempElement.textContent = item.text;
      const itemWidth = tempElement.offsetWidth;
      
      const neededWidth = totalWidth + itemWidth + (visibleCount > 0 ? gap : 0);
      const remainingWidth = containerWidth - (showExpandButton ? expandButtonWidth + ellipsisWidth : 0);
      
      if (neededWidth <= remainingWidth) {
        totalWidth = neededWidth;
        visibleCount++;
      } else {
        break;
      }
    }
    
    this.contentRef.current.removeChild(tempElement);
    return Math.max(0, visibleCount);
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
              className={classnames('item-item', item.customCSS)}
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
    const { expanded, showExpandButton } = this.state;
    const containerClassName = `expandable-items ${expanded ? 'expandable-items--expanded' : ''}`;
    
    // 使用自定义的expandButton配置或默认值
    const buttonText = expanded ? expandButton.collapseText : expandButton.expandText;
    const buttonTitle = expandButton?.title || buttonText;
    const buttonClassName = classnames('expand-button', expandButton.customCSS);
    
    return (
      <div ref={this.containerRef} className={containerClassName}>
        <div ref={this.contentRef} className="item-list">
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