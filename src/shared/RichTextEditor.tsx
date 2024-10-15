import { headingsPlugin, MDXEditor, toolbarPlugin } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const RichTextEditor = () => {
  return (
    <MDXEditor markdown={"# test"} plugins={[headingsPlugin(), toolbarPlugin()]} />
  );
};

export default RichTextEditor;