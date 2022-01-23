import { FilesApi, RemoteFileInterface } from './../types';
import { FileUploader } from './../workers/file_uploader';

describe('file uploader', () => {
  let apiService;
  let uploader: FileUploader;
  let file: RemoteFileInterface;

  beforeEach(() => {
    apiService = {} as jest.Mocked<FilesApi>;
    apiService.uploadFileBytes = jest.fn().mockReturnValue({ success: true });

    file = {
      remoteIdentifier: '123',
    };

    uploader = new FileUploader(file, apiService);
  });

  it('should return true when a chunk is uploaded', async () => {
    const bytes = new Uint8Array();
    const success = await uploader.uploadBytes(bytes);

    expect(success).toEqual(true);
  });
});
