/*DTO для изменения поста по ID блога и ID поста.*/
export class UpdatePostByBlogIdAndPostIdDTO {
  public blogId: string;
  public id: string;
  public title: string;
  public shortDescription: string;
  public content: string;
}
