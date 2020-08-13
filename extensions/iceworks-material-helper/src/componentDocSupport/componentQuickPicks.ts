/* eslint-disable dot-notation */
import * as vscode from 'vscode';
import getJsxElements from '../utils/getJsxElements';
import openInBrowser from './openInBowser';
import { getDocInfos } from './docInfoCache';
import { IComponentDocInfo } from './type';
import i18n from '../i18n';

// 这里展示的是框架所能提供的所有物料的文档。
export async function showComponentDocQuickPicks() {
  showQuickPick(await getDocInfos());
}

// 这里展示的是当前文件中使用的物料的文档。
export async function showUsedComponentDocQuickPicks(uri: vscode.Uri) {
  const documentEditor = getVisibleEditer(uri);
  showQuickPick(await getUsedComponentDocInfos(documentEditor?.document.getText()));
}

function showQuickPick(quickPickItems: any[]) {
  if (quickPickItems.length === 0) {
    vscode.window.showWarningMessage(i18n.format('extension.iceworksMaterialHelper.getComponentQuickPicks.noMaterial'));
  } else {
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = quickPickItems;
    quickPick.onDidChangeSelection((selection) => {
      if (selection[0]['command']) {
        vscode.commands.executeCommand(selection[0]['command']);
      } else {
        openInBrowser(selection[0]['url']);
      }
      quickPick.dispose();
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  }
}

async function getUsedComponentDocInfos(documentText = ''): Promise<IComponentDocInfo[]> {
  const docInfos: IComponentDocInfo[] = [];
  const allDocInfos = getDocInfos();

  const componentNames = getDocInfos().map((docInfo) => docInfo.label);
  const usedComponentJsxElements = getJsxElements(documentText, (element) => {
    return componentNames.includes(element.name['name'] || '');
  });

  usedComponentJsxElements.forEach((elements) => {
    docInfos.push(
      allDocInfos.find((info) => {
        return info.label === elements?.name['name'];
      })!
    );
  });
  docInfos.push({
    label: i18n.format('extension.iceworksMaterialHelper.getComponentQuickPicks.more.label'),
    description: '',
    detail: i18n.format('extension.iceworksMaterialHelper.getComponentQuickPicks.more.detail'),
    command: 'iceworks-material-helper:showAllMaterialQuickPicks',
    url: '',
  });
  return docInfos;
}

function getVisibleEditer(uri: vscode.Uri) {
  return vscode.window.visibleTextEditors.find((editor) => {
    return editor.document.uri.toString() === uri.toString();
  });
}