#include <gtk/gtk.h>

GtkWidget* window;
GtkWidget* label;
GThread* thread;

gint function() {
  gdk_threads_enter();
  window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
  label = gtk_label_new("my text");
  gtk_container_add(GTK_CONTAINER(window), label);
  gtk_widget_realize(window);
  gtk_widget_show_all(window);
  gdk_threads_leave();
  //sleep(10000);
}
gint main(int argc, char* argv[]) {
  g_thread_init(NULL);
  gdk_threads_init();
  gtk_init(&argc, &argv);
  thread = g_thread_create((GThreadFunc)function, NULL, TRUE, NULL);
  g_thread_join(thread);
  gtk_widget_show_all(window);
  gdk_threads_enter();
  gtk_main();
  gdk_threads_leave();
}