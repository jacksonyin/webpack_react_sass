interface ClassArray extends Array<ClassValue> { }
interface ClassDictionary { [id: string]: any; }
type ClassValue = string | number | ClassDictionary | ClassArray | undefined | null | boolean;

type DragNodeProps = {
  root: HTMLElement;
  handler: HTMLElement;
  container: HTMLElement;
};

export const classnames = (...classes: ClassValue[]): string => {
  const result: string[] = [];

  for (let i = 0; i < classes.length; i++) {
    const cssClass = classes[i];
    const cssClassType = typeof cssClass;
    if (!cssClass) continue;

    if (cssClassType === 'string' || cssClassType === 'number') result.push(`${cssClass}`);
    else if (Array.isArray(cssClass) && cssClass.length) result.push(classnames(cssClass));
    else if (cssClassType === 'object') Object.keys(cssClass).forEach((key: string) => (cssClass as ClassDictionary)[key] && result.push(key));
  }

  return result.join(' ');
};

export const sum = (a: number, b: number): number => a + b;
