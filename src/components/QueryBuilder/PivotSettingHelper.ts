export class PivotSettingHelper {
  constructor(private pivotSetting: any) {
  }

  getColumn(name: string) {
    const result = this.pivotSetting.datasetSchema.columns[name];
    return result;
  }
}
