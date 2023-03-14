import { Injectable } from '@nestjs/common';
import { MergeRequests, MergeRequestDiscussions } from '@gitbeaker/node';

@Injectable()
export class GitlabReviewService {
  private blackPostfixList: string[] = [
    'txt',
    'md',
    'json',
    'svg',
    'styl',
    'less',
    'sass',
    'zip',
    'csv',
  ];
  async startReview(gitlabConfig: {
    projectId: string;
    token: string;
    language: string;
    host: string;
  }): Promise<any> {
    const API = new MergeRequests(gitlabConfig);
    const data = await API.all({
      projectId: gitlabConfig.projectId,
      state: 'opened',
    });
    this.addDiscussionForEveryAnswer(gitlabConfig, data[0].iid);
    return 'data';
  }

  async getAnswerResult(gitlabConfig, mergeRequestId) {
    const { changes: changeList, diff_refs: diffRefs } =
      await this.getCodeChanges(gitlabConfig, mergeRequestId);
    const filterList = changeList.filter((x) => {
      const filePostfix = x.new_path.match(/\w+$/)[0];
      const isLegalFile = !this.blackPostfixList.includes(filePostfix);
      const isChangeFile = !x.new_file && !x.renamed_file && !x.deleted_file;
      const isNotBinaryFile = !x.diff.startsWith('Binary files');
      return isChangeFile && isNotBinaryFile && isLegalFile;
    });
    const allAnswers = filterList.map((x) =>
      this.getChatGPTAnswer(x.diff, gitlabConfig),
    );
    const result = await Promise.all(allAnswers);
    return filterList.map((x, index) => {
      return {
        ...x,
        answer: result[index],
        diffRefs,
      };
    });
  }

  async getCodeChanges(gitlabConfig, mergeRequestId): Promise<any> {
    const API = new MergeRequests(gitlabConfig);
    return await API.changes(gitlabConfig.projectId, mergeRequestId);
  }

  async addDiscussionForEveryAnswer(
    gitlabConfig,
    mergeRequestId,
  ): Promise<any> {
    try {
      const API = new MergeRequestDiscussions(gitlabConfig);
      const result = await this.getAnswerResult(gitlabConfig, mergeRequestId);
      const batchSetDiscussion = result.map((item) => {
        const prefixDiffInfo = item.diff.match(/@@.*?@@/)[0];
        const codeLine = prefixDiffInfo.match(/\d+/g);
        const position = {
          ...item.diffRefs,
          position_type: 'text',
          old_path: item.old_path,
          new_path: item.new_path,
        };
        // 向上俩格提交评论
        const upCommentNumber = 2;
        const [oldStart, oldDeleteNum, newStart, newDeleteNum] = [
          parseInt(codeLine[0] || 0),
          parseInt(codeLine[1] || 0),
          parseInt(codeLine[2] || 0),
          parseInt(codeLine[3] || 0),
        ];
        // 当删去的的行数大于新增行数时, 不能添加 old_line, 否则会添加 comment 失败
        if (newDeleteNum !== 0) {
          position.old_line = oldStart + oldDeleteNum;
        }
        position.new_line = newStart + newDeleteNum;

        if (
          position.old_line > upCommentNumber &&
          position.new_line > upCommentNumber
        ) {
          position.old_line -= upCommentNumber;
          position.new_line -= upCommentNumber;
        }
        return API.create(gitlabConfig.projectId, mergeRequestId, item.answer, {
          position,
        });
      });
      await Promise.all(batchSetDiscussion);
      console.log('已提交评论');
    } catch (error) {
      console.log(error);
    }
  }

  async getChatGPTAnswer(question: string, gitlabConfig) {
    const importDynamic = new Function(
      'modulePath',
      'return import(modulePath)',
    );
    const { ChatGPTAPI } = await importDynamic('chatgpt');
    const api = new ChatGPTAPI({
      apiKey: 'YOU_ARE_CHATGPT_TOKEN',
    });

    const langueConfig = {
      EN: 'Please answer in English',
      ZH: '请以中文简体回答',
    };
    const res = await api.sendMessage(`
    以下是 gitlab 上进行改动后的代码, 请你 review 后给出建议, 数据格式 gitlab comment 的格式, 如果无法给出有效建议, 请回答 "无" 即可, ${
      langueConfig[gitlabConfig.language]
    }:
      ${question}
    `);
    return res.text;
  }
}
